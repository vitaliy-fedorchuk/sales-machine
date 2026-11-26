import { Fragment } from "react";

/**
 * Імена у відгуку («Ирина Банкова, Павел Бородовских»): кожне «Имя Фамилия» не розривається —
 * якщо рядок не влазить, на новий рядок переходить людина цілком.
 */
export default function PersonNames({ name }: { name: string }) {
  const people = name.split(/,\s*/);
  return (
    <>
      {people.map((p, i) => (
        <Fragment key={i}>
          <span style={{ whiteSpace: "nowrap" }}>{p}</span>
          {i < people.length - 1 && ", "}
        </Fragment>
      ))}
    </>
  );
}
