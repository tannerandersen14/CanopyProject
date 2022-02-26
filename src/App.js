import { useEffect, useRef, useState, useMemo } from "react";
import "./App.css";
import { SuiteNames } from "./const";
import { createNewDeck, drawCardsFromDeck, shuffleExistingDeck } from "./Api";

function App() {
  const [drawnDeckId, setDrawnDeckId] = useState("");
  const [drawnCards, setDrawnCards] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  // Using a reference to the state of drawn cards is necessary to access it from within a timeout
  const drawnCardsRef = useRef(drawnCards);
  const intervalRef = useRef(null);

  const drawTwoCards = async () => {
    const retrievedCards = await drawCardsFromDeck(drawnDeckId, 2);
    return setDrawnCards((existingCards) => [
      ...existingCards,
      ...retrievedCards.cards,
    ]);
  };

  const checkCompletion = () => {
    // If drawn array of cards contains all queens then return true, else return false
    const conditions = ["QS", "QD", "QC", "QH"];
    const cardCodeValues = drawnCardsRef.current.map((card) => card.code);
    return conditions.every((code) => cardCodeValues.includes(code));
  };

  const runCardDraw = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(cardDrawStep, 1000);
  };

  const cardDrawStep = async () => {
    // Check if parameters for stopping have been met (All queens found)
    if (checkCompletion()) {
      setIsComplete(true);
      return;
    }
    await drawTwoCards();
  };

  const shuffleAndRestart = async () => {
    if (intervalRef.current) clearTimeout(intervalRef.current);
    setDrawnCards([]);
    setIsComplete(false);
    await shuffleExistingDeck(drawnDeckId);
    runCardDraw();
  };

  useEffect(async () => {
    // Request new deck on component mount and set ID into state
    const retrievedDeck = await createNewDeck();
    setDrawnDeckId(retrievedDeck.deck_id);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    // Update the drawn cards ref upon seeing a change in the drawn cards state
    drawnCardsRef.current = drawnCards;
  }, [drawnCards]);

  // When drawn deck ID changes restart the draw
  useEffect(() => {
    if (!drawnDeckId) return;
    runCardDraw();
  }, [drawnDeckId]);

  const convertCardIdentiferToInt = (title) => {
    const sortPriority = {
      0: 10,
      A: 1,
      J: 11,
      Q: 12,
      K: 13,
    };
    if (sortPriority[title]) return sortPriority[title];
    return parseInt(title);
  };

  // Memoize the provider value so the object doesn't necessarily need to change each render
  const sortedSuites = useMemo(() => {
    const nameMap = {
      0: 10,
      A: "ACE",
      J: "JACK",
      Q: "QUEEN",
      K: "KING",
    };
    const suites = {
      S: [],
      H: [],
      D: [],
      C: [],
    };

    // Move each card to its respective suite
    drawnCards.forEach((card) => {
      suites[card.code[1]].push({
        ...card,
        name: nameMap[card.code[0]] || card.code[0],
      });
    });

    // Sort each suite individually
    const suiteKeys = Object.keys(suites);
    Object.values(suites).forEach((suite, i) => {
      const suiteKey = suiteKeys[i];
      suites[suiteKey] = suite.sort((a, b) => {
        const aCheck = convertCardIdentiferToInt(a.code[0]);
        const bCheck = convertCardIdentiferToInt(b.code[0]);
        return aCheck - bCheck;
      });
    });

    return suites;
  }, [drawnCards]);

  const sortedSuiteKeys = Object.keys(sortedSuites);
  return (
    <div className="App">
      <header onClick={runCardDraw} className="App-header">
        <h4>
          {isComplete
            ? `All Queens Drawn! (${drawnCards.length} Drawn Total)`
            : `${drawnCards.length} Cards Drawn`}
        </h4>
        <br />
        <a href="#" onClick={shuffleAndRestart}>
          Shuffle And Restart
        </a>
        <div className="Sections">
          {Object.values(sortedSuites).map((suite, i) => {
            const suiteKey = sortedSuiteKeys[i];
            const suiteTitle = SuiteNames[suiteKey];
            return (
              <section
                key={suiteKey}
                data-testid={`section_${suiteKey}`}
                className="Section"
              >
                <h4>{suiteTitle}</h4>
                <p className="SectionJSON">
                  {JSON.stringify(suite.map((card) => card.name)).replace(
                    /"/g,
                    ""
                  )}
                </p>
                <ul className="SectionList">
                  {suite.map((card) => (
                    <li key={card.code}>
                      <img className="Card" src={card.image} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </header>
    </div>
  );
}

export default App;
