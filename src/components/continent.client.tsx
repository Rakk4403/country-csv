"use client";

import { useEffect, useRef, useState } from "react";
import countriesJson from "../res/countries.json";
import { useSnackbar } from "./snackbar.client";

type Country = {
  name: {
    common: string;
    official: string;
  };
  continents: string[];
};

type CountryNameMap = {
  // similar country name: official name
  [name: string]: string;
};

type NameToContienetMap = {
  [officialName: string]: string[];
};

function createSimilarNames(country: Country): string[] {
  const names: string[] = [];
  names.push(country.name.common);
  if (country.name.official !== country.name.common) {
    names.push(country.name.official);
  }

  return names;
}

function createCountryNameMap(metaData: Country[]): CountryNameMap {
  const countryNameMap: CountryNameMap = {};
  for (const country of metaData) {
    const names = createSimilarNames(country);
    for (const name of names) {
      countryNameMap[name.toLowerCase()] = country.name.official;
    }
  }
  return countryNameMap;
}

function createNameToContienetMap(metaData: Country[]): NameToContienetMap {
  const nameToContienetMap: NameToContienetMap = {};
  for (const country of metaData) {
    nameToContienetMap[country.name.official] = country.continents;
  }
  return nameToContienetMap;
}

type ExactInputLine = {
  input: string;
  exact: true;
  official: string;
  continents: string[];
};

type PartialInputLine = {
  input: string;
  exact: false;
  names: string[];
  official: string[];
  continents: string[];
  selectedIndex?: number;
};

type InputLine = ExactInputLine | PartialInputLine;

function CountrySelector({
  names,
  dupString,
  selectedIndex,
  onSelect,
}: {
  names: string[];
  dupString?: string;
  selectedIndex?: number;
  onSelect: (idx: number) => void;
}) {
  const borderStyles = {
    borderRadius: 3,
    backgroundColor: "lightgreen",
  };

  return names.map((name, idx) => (
    <div
      key={name}
      className="countrySelect"
      style={idx === selectedIndex ? borderStyles : {}}
      onClick={(e) => onSelect && onSelect(idx)}
    >
      {dupString ? (
        <>
          {name.substring(0, name.toLowerCase().indexOf(dupString))}
          <span style={{ backgroundColor: "rgba(28, 139, 145, 0.5)" }}>
            {name.substring(
              name.toLowerCase().indexOf(dupString),
              name.toLowerCase().indexOf(dupString) + dupString.length
            )}
          </span>
          {name.substring(
            name.toLowerCase().indexOf(dupString) + dupString.length,
            name.length
          )}
        </>
      ) : (
        name
      )}
    </div>
  ));
}

export default function CountryContinent() {
  const [inputCountries, setInputCountries] = useState<string[]>([]);
  const [metaData, setMetaData] = useState<any[]>([]);
  const [countryNameMap, setCountryNameMap] = useState<CountryNameMap>({});
  const [nameToContienetMap, setNameToContienetMap] =
    useState<NameToContienetMap>({});
  const [data, setData] = useState<any[]>([]);
  const outputRef = useRef(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    (async () => {
      const metaData = countriesJson as Country[];
      const countryNameMap = createCountryNameMap(metaData);
      setCountryNameMap(countryNameMap);
      const nameToContienetMap = createNameToContienetMap(metaData);
      setNameToContienetMap(nameToContienetMap);
    })();
  }, []);

  useEffect(() => {
    const inputLines: InputLine[] = inputCountries.map((country) => {
      const completeName = countryNameMap[country.toLowerCase()];
      if (completeName) {
        return {
          input: country,
          official: completeName,
          continents: nameToContienetMap[completeName],
          exact: true,
        };
      }

      const partialNames = Object.keys(countryNameMap)
        .filter((name) => name.includes(country.toLowerCase()))
        .map((name) => countryNameMap[name])
        .filter((name, index, self) => self.indexOf(name) === index);
      if (partialNames.length === 1) {
        const partialName = partialNames[0];
        return {
          input: country,
          exact: true,
          official: countryNameMap[partialName.toLowerCase()],
          continents:
            nameToContienetMap[countryNameMap[partialName.toLowerCase()]],
        };
      }
      return {
        input: country,
        exact: false,
        names: partialNames,
        official: partialNames.map(
          (name) => countryNameMap[name.toLowerCase()]
        ),
        continents: partialNames.flatMap(
          (name) => nameToContienetMap[countryNameMap[name.toLowerCase()]]
        ),
      };
    });

    setData(
      inputLines.map((line) => {
        if (line.exact) {
          return {
            input: line.input,
            exact: line.exact,
            official: line.official,
            continents: line.continents,
          };
        }
        return {
          input: line.input,
          exact: line.exact,
          names: line.names,
          official: line.official,
          continents: line.continents,
        };
      })
    );
  }, [inputCountries]);

  const handleChangeInputText = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    const lines = value
      .split("\n")
      .flatMap((line) => line.split(","))
      .filter((line) => line.trim() !== "");

    const countries = lines.map((line) => line.trim());
    setInputCountries(countries);
  };

  const handleSelectCountry = (key: string, idx: number) => {
    setData(
      data.map((country) => {
        if (country.input === key) {
          return {
            ...country,
            selectedIndex: idx,
          };
        }
        return country;
      })
    );
  };

  const handleCopy = async () => {
    showSnackbar("Copied to clipboard");
    const text = outputRef.current?.value ?? "";
    await navigator.clipboard.writeText(text);
  };

  const handleDownload = async () => {
    const text = outputRef.current?.value ?? "";
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "country_location.txt";
    a.click();
  };

  const handleChangeOutputText = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const selectableData = data.filter((country) => !country.exact);

  const outputValue = data
    .map((country: InputLine) => {
      if (country.exact) {
        return `${country.input},${country.continents[0]}`;
      }

      if (country.selectedIndex == undefined) {
        return `${country.input},"Not Found"`;
      }
      return `${country.input},${country.continents[country.selectedIndex]}`;
    })
    .join("\n");

  return (
    <main className="flex flex-col gap-2.5">
      <h1>Continent by Country name</h1>
      <div className="flex flex-col gap-5">
        <p>
          Enter country names and find their continents. If the country name is
          not found, select from the list of similar names.
        </p>
        <div>
          <p>Example:</p>
          <div className="flex gap-2.5 items-center">
            <textarea
              readOnly
              value={"USA\nsouth Korea"}
              className="resize-none"
            />
            ➡️
            <textarea
              readOnly
              value={"USA, North America\nsouth korea, Asia"}
              className="resize-none"
            />
          </div>
        </div>
        <div>
          <p>Input:</p>
          <textarea
            className="w-full border border-gray-300 p-0.5"
            style={{ overflowY: "auto" }}
            onChange={handleChangeInputText}
          />
        </div>
        {selectableData.length > 0 && (
          <div className="transition-all ease-in-out duration-50 border-solid border-2 border-red-800 rounded">
            <span>Errors:</span>
            <table>
              <colgroup>
                <col style={{ width: 80 }} />
                <col style={{ width: 200 }} />
                <col style={{ width: 300 }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Line</th>
                  <th>You typed</th>
                  <th>Country Names</th>
                </tr>
              </thead>
              <tbody>
                {data
                  .filter((country) => !country.exact)
                  .map((country) => (
                    <tr key={country.input}>
                      <td>
                        <div>Line {inputCountries.indexOf(country.input)}</div>
                      </td>
                      <td>{country.input}</td>
                      <td>
                        {country.names.length > 0
                          ? "Alternatives:"
                          : "Not Found!"}
                        <ul>
                          {country.names.map((name, idx) => (
                            <li key={name}>{name}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <span>Output</span>
            <div className="flex gap-1">
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                onClick={handleDownload}
              >
                DOWNLOAD
              </button>
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                onClick={handleCopy}
              >
                COPY
              </button>
            </div>
          </div>
          <textarea
            ref={outputRef}
            className={`w-full border border-gray-300 p-0.5`}
            value={outputValue}
            onChange={handleChangeOutputText}
          />
        </div>
      </div>
    </main>
  );
}
