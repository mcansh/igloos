import type { MetaFunction } from "@vercel/remix";

export const meta: MetaFunction = () => {
  return [{ title: "Igloo Availability Checker" }];
};

export default function Index() {
  return (
    <>
      <h1 className="mb-2 text-2xl text-purple-500">
        Find an available igloo!
      </h1>
      <p>
        By default this runs automatically every 15 minutes via a{" "}
        <a
          href="https://github.com/mcansh/igloos/actions?query=workflow%3A%22check+for+igloos%22"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-500"
        >
          GitHub Action
        </a>
        , but you can also manually{" "}
        <a href="/run" className="text-purple-500">
          run it
        </a>{" "}
        if you'd like.
      </p>
    </>
  );
}
