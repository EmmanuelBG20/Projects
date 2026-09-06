import { auth } from "@/lib/auth";
import { ProfileNameForm, ChangePasswordForm } from "@/components/account/ProfileForms";

export default async function PerfilPage() {
  const session = await auth();

  return (
    <div className="max-w-lg">
      <h1 className="section-title">Mi perfil</h1>
      <p className="mb-6 text-sm text-neutral-400">{session!.user.email}</p>
      <ProfileNameForm initialName={session!.user.name ?? ""} />
      <ChangePasswordForm />
    </div>
  );
}
