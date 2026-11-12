import LoginForm from "../../components/LoginForm";

export default function LoginPage({ searchParams }) {
  return <LoginForm initialType={searchParams?.type} />;
}