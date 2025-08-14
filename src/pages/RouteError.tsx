import { useRouteError } from "react-router-dom";

export default function RouteError() {
  const error = useRouteError();
  console.error(error);
  return (
    <div
      style={{
        padding: "20px",
        margin: "auto",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred. Please refresh the page.</p>
      <p></p>
    </div>
  );
}
