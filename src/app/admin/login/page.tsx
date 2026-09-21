import SiteHeader from "@/components/SiteHeader";
import LoginForm from "./LoginForm";

export const metadata = { title: "Admin sign in | Fade & Co." };

export default async function LoginPage(props: PageProps<"/admin/login">) {
  const sp = await props.searchParams;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-20">
        <h1 className="text-2xl font-bold">Admin sign in</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Enter your email and we will send you a one-time sign-in link.
        </p>
        {sp.error && (
          <p className="mt-4 rounded-md bg-red-500/10 p-3 text-sm text-red-300">
            That link is invalid or expired. Request a new one.
          </p>
        )}
        <LoginForm />
      </main>
    </>
  );
}
