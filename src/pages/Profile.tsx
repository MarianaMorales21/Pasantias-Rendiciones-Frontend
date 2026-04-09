import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ProfileCard from "../components/UserProfile/ProfileCard";
import PageMeta from "../components/common/PageMeta";

export default function Profile() {
  return (
    <>
      <PageMeta
        title="FUNDES - Rendiciones | Profile"
        description="FUNDES - Rendiciones | Profile"
      />
      <PageBreadcrumb pageTitle="Perfil" />
      <div className="max-w-4xl mx-auto">
        <ProfileCard />
      </div>
    </>
  );
}
