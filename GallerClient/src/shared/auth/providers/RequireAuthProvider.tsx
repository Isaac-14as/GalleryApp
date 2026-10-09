import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import { authConstants } from "../api/auth-axios";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};
export const RequireAuthProvider = observer(({ children }: Props) => {
  if (!localStorage.getItem(authConstants.tokenString)) {
    return <Navigate to={"/login"} />;
  }

  return <div>{children}</div>;
});
