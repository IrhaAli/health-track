import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";

const index = () => {
  const [token, setToken] = useState(undefined);

  // useEffect(() => {
  //   const page = "/" + (token ? "(tabs)" : "(signup)") + "/index.tsx";
  //   // router.push(page);
  // }, [token]);

  return (
    <>
      <Redirect href={token ? "/(tabs)" : "/(signup)"} />
    </>
  );
};

export default index;
