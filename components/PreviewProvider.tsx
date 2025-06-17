// Legacy preview provider - now just passes through children
function LiveQueryProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
export default function PreviewProvider({
  children,
  token,
}: {
  children: React.ReactNode
  token: string
}) {
  return <LiveQueryProvider>{children}</LiveQueryProvider>
}
