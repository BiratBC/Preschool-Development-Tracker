import React from "react";
import Link from "next/link";
export default function Home() {
  return (
    <>
      <div className="bg-primary text-30-extrabold">
        <p>hello from root</p>
      </div>
      <div className="bg-secondary flex flex-col justify-center items-center">
      <Link href="/login" className="startup-form_btn my-5 text-center">Login</Link>
      <Link href="/signup" className="startup-form_btn my-5 text-center">Sign up</Link>
      </div>
    </>
  );
}
