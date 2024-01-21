import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

export function useAuthStatus() {
  const [loggedIn, setLoggedIn] = useState(false); //suppose the person is new and false, then need check the person is authenticated or not
  const [checkingStatus, setCheckingStatus] = useState(true); //we need some time to get information from firebase, need another hook that check the status, come or not, otherwise need the loading affect

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true); //set it true if the person is authenticated, check it by onAuthStateChanged
      }
      setCheckingStatus(false); //after checking doesn't matter above's result, set the loading to false
    });
  }, []); //use useState to ask firebase that if the person is authenticated or not
  return { loggedIn, checkingStatus };
}

// export { useAuthStatus };
// because in PrivateRoute we import { loggedIn, checkingStatus }, here we can not use default
//so we are getting both of them from user state by destructuring the logging and the checking status
