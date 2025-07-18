#!/usr/bin/env node

/**
 * HTTPS Development Server for Forge Journal
 *
 * This script starts the Next.js development server with HTTPS enabled
 * using self-signed certificates. This is required for testing features
 * like Virtuous Forms that require HTTPS.
 *
 * Usage: npm run dev:https
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

// Check if mkcert is installed
function checkMkcert() {
  return new Promise((resolve) => {
    const mkcert = spawn('mkcert', ['-version'], { stdio: 'pipe' })
    mkcert.on('close', (code) => {
      resolve(code === 0)
    })
    mkcert.on('error', () => {
      resolve(false)
    })
  })
}

// Install mkcert if not present
async function installMkcert() {
  console.log('📦 Installing mkcert...')

  const platform = process.platform
  let installCommand

  if (platform === 'darwin') {
    // macOS - check if Homebrew is available
    installCommand = 'brew install mkcert'
  } else if (platform === 'linux') {
    installCommand = 'sudo apt-get install mkcert || sudo yum install mkcert'
  } else {
    console.log('❌ Please install mkcert manually for your platform:')
    console.log('   Visit: https://github.com/FiloSottile/mkcert#installation')
    process.exit(1)
  }

  console.log(`Running: ${installCommand}`)

  return new Promise((resolve, reject) => {
    const install = spawn('sh', ['-c', installCommand], { stdio: 'inherit' })
    install.on('close', (code) => {
      if (code === 0) {
        console.log('✅ mkcert installed successfully')
        resolve()
      } else {
        console.log('❌ Failed to install mkcert automatically')
        console.log('   Please install mkcert manually: https://github.com/FiloSottile/mkcert#installation')
        reject(new Error('mkcert installation failed'))
      }
    })
  })
}

// Create certificates
async function createCertificates() {
  const certDir = path.join(__dirname, '..', '.certs')
  const keyPath = path.join(certDir, 'localhost-key.pem')
  const certPath = path.join(certDir, 'localhost.pem')

  // Create .certs directory if it doesn't exist
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true })
  }

  // Check if certificates already exist
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    console.log('✅ SSL certificates already exist')
    return { keyPath, certPath }
  }

  console.log('🔐 Creating SSL certificates...')

  return new Promise((resolve, reject) => {
    const mkcert = spawn('mkcert', [
      '-key-file', keyPath,
      '-cert-file', certPath,
      'localhost',
      '127.0.0.1',
      '::1'
    ], {
      stdio: 'inherit',
      cwd: certDir
    })

    mkcert.on('close', (code) => {
      if (code === 0) {
        console.log('✅ SSL certificates created successfully')
        resolve({ keyPath, certPath })
      } else {
        reject(new Error('Certificate creation failed'))
      }
    })
  })
}

// Start Next.js with HTTPS using proxy approach
async function startNextWithHTTPS(keyPath, certPath) {
  console.log('🚀 Starting Next.js development server...')

  // Start Next.js on port 3001
  const nextProcess = spawn('npx', ['next', 'dev', '--turbopack', '--port', '3001'], {
    stdio: 'pipe',
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  })

  let nextReady = false
  let httpsServer = null

  // Monitor Next.js output
  nextProcess.stdout.on('data', (data) => {
    const output = data.toString()
    process.stdout.write(output)

    // Wait for Next.js to be ready
    if ((output.includes('Ready in') || output.includes('compiled successfully')) && !nextReady) {
      nextReady = true
      startHTTPSProxy(keyPath, certPath)
    }
  })

  nextProcess.stderr.on('data', (data) => {
    process.stderr.write(data)
  })

  nextProcess.on('close', (code) => {
    console.log(`Next.js process exited with code ${code}`)
    if (httpsServer) {
      httpsServer.close()
    }
    process.exit(code)
  })

  // Start HTTPS proxy server
  function startHTTPSProxy(keyPath, certPath) {
    console.log('🔒 Starting HTTPS proxy...')

    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    }

    httpsServer = https.createServer(httpsOptions, (req, res) => {
      // Proxy all requests to Next.js on port 3001
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          host: 'localhost:3001'
        }
      }

      const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers)
        proxyRes.pipe(res)
      })

      proxyReq.on('error', (err) => {
        console.error('Proxy error:', err)
        res.writeHead(500)
        res.end('Proxy error')
      })

      req.pipe(proxyReq)
    })

    httpsServer.listen(3000, (err) => {
      if (err) {
        console.error('HTTPS server error:', err)
        return
      }
      console.log('\n✅ HTTPS development server is running!')
      console.log('🔒 https://localhost:3000 (HTTPS)')
      console.log('📝 http://localhost:3001 (Next.js)')
      console.log('\nPress Ctrl+C to stop the server')
    })

    httpsServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log('\n⚠️  Port 3000 is already in use.')
        console.log('Please stop any other servers and try again.')
        nextProcess.kill()
        process.exit(1)
      } else {
        console.error('HTTPS server error:', err)
      }
    })
  }

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down HTTPS development server...')
    if (httpsServer) {
      httpsServer.close()
    }
    nextProcess.kill('SIGINT')
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    if (httpsServer) {
      httpsServer.close()
    }
    nextProcess.kill('SIGTERM')
    process.exit(0)
  })
}

// Main function
async function main() {
  try {
    console.log('🔒 Setting up HTTPS development environment for Forge Journal...')

    // Check if mkcert is installed
    const hasMkcert = await checkMkcert()

    if (!hasMkcert) {
      await installMkcert()
    }

    // Install CA if not already done
    console.log('🔐 Installing local CA...')
    const installCA = spawn('mkcert', ['-install'], { stdio: 'inherit' })
    await new Promise((resolve) => {
      installCA.on('close', resolve)
    })

    // Create certificates
    const { keyPath, certPath } = await createCertificates()

    // Start Next.js with HTTPS
    await startNextWithHTTPS(keyPath, certPath)

  } catch (error) {
    console.error('❌ Error setting up HTTPS development server:', error.message)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}