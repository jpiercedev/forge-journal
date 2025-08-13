import AlertBanner from 'components/AlertBanner'
import CookieConsent from 'components/CookieConsent'
import Footer from 'components/Footer'
import FooterAlert from 'components/FooterAlert'
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

      {/* Footer Alert - Subscribe Banner */}
      <FooterAlert />

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </>
  )
}
