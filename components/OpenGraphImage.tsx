// Renders the Open Graph image used on the home page

export const width = 1200
export const height = 630

export function OpenGraphImage(props: { title: string }) {
  const { title } = props
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        textAlign: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        flexWrap: 'nowrap',
        background: 'linear-gradient(135deg, #1e4356 0%, #be9d58 50%, #1e4356 100%)',
        position: 'relative',
      }}
    >
      {/* Logo Container */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '40px',
        }}
      >
        {/* Forge Journal Logo Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: 'white',
            fontFamily: 'Proxima Nova, sans-serif',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              marginBottom: '8px',
            }}
          >
            THE FORGE
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'normal',
              letterSpacing: '4px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              opacity: 0.9,
            }}
          >
            JOURNAL
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontStyle: 'normal',
          color: 'white',
          marginTop: '30px',
          textAlign: 'center',
          fontFamily: 'Proxima Nova, sans-serif',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          opacity: 0.9,
          maxWidth: '800px',
          lineHeight: 1.4,
        }}
      >
        Shaping leaders and pastors who shape the nation
      </div>
    </div>
  )
}
