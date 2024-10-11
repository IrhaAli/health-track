import { Redirect, Stack } from "expo-router";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";

const index = () => {
  const [auth, setAuth] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const user: any = await getAuth().currentUser;
      const userJSON: any = user?.toJSON();
      setAuth(userJSON?.uid);
    };
    fetchUser();
  }, []);

  return <Redirect href={auth ? "/(tabs)" : "/(login)"} />;
};

export default index;