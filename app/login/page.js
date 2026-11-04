import LoginForm from "@/components/LoginForm";

export const metadata = { title: "ERP Login — The Little Moon Academy" };

export default function LoginPage({ searchParams }) {
  return <LoginForm initialType={searchParams?.type} />;
}
