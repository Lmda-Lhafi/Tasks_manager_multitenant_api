import React from "react";
import Auth from "./sections/Auth.jsx";
import User from "./sections/User.jsx";
import Task from "./sections/Task.jsx";

export default function App() {
  return (
    <div>
      <Auth />
      <User />
      <Task />
    </div>
  );
}
