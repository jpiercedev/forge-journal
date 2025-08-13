import AlertBanner from 'components/AlertBanner'
import CookieConsent from 'components/CookieConsent'
import Footer from 'components/Footer'
import Navigation from 'components/Navigation'

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

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </>
  )
}
