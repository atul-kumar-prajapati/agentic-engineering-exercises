interface ScenarioBoardProps {
  focus: string[];
}

export function ScenarioBoard({ focus }: ScenarioBoardProps) {
  return (
    <section className="scenario-board" aria-label="Exercise focus">
      <h2>Exercise focus</h2>
      <ol>
        {focus.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </section>
  );
}
