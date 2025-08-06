import AuthForm from '../components/AuthForm';

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 flex justify-center items-center min-h-[50vh] sm:min-h-[60vh]">
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  );
} 