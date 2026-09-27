// "/account" moved to being a group of sub-pages (my-profile, address,
// change-password) - bare "/account" now just lands on the profile page.
export async function getServerSideProps() {
  return { redirect: { destination: "/account/my-profile", permanent: false } };
}

export default function AccountIndex() {
  return null;
}
