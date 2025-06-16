import AlertBanner from 'components/AlertBanner'
import Navigation from 'components/Navigation'
import Footer from 'components/Footer'

export default function Layout({
  preview,
  loading,
  children,
}: {
  preview: boolean
  loading?: boolean
  children: React.ReactNode
}) {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <AlertBanner preview={preview} loading={loading} />
        <Navigation />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </>
  )
}
