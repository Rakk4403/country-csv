"use client";

import { useEffect, useRef, useState } from "react";
import countriesJson from "../res/countries.json";

type Country = {
  name: {
    common: string;
    official: string;
    // nativeName?: {
    //   cat?: {
    //     official?: string;
    //     common?: string;
    //   };
    // };
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
          {name.substring(name.toLowerCase().indexOf(dupString) + dupString.length, name.length)}
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
  const [nameToContienetMap, setNameToContienetMap] = useState<NameToContienetMap>({});
  const [data, setData] = useState<any[]>([]);
  const outputRef = useRef<HTMLTextAreaElement>(null);

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
          continents: nameToContienetMap[countryNameMap[partialName.toLowerCase()]],
        };
      }
      return {
        input: country,
        exact: false,
        names: partialNames,
        official: partialNames.map((name) => countryNameMap[name.toLowerCase()]),
        continents: partialNames.flatMap((name) => nameToContienetMap[countryNameMap[name.toLowerCase()]]),
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

  const handleChangeInputText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
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

  const selectableData = data.filter((country) => !country.exact);

  return (
    <main>
      <h1>Continent by country name</h1>
      <p>
        Enter country names and find their continents. If the country name is not found, select from the list of similar
        names.
      </p>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div>
          <p>
            Input) <br />
            USA
            <br />
            south korea
          </p>
        </div>
        ➡️
        <div>
          <p>
            Output) <br />
            USA, North America
            <br />
            south korea, Asia
          </p>
        </div>
      </div>
      <textarea style={{ width: "100%", border: "solid 1px #ddd", padding: 1 }} onChange={handleChangeInputText} />
      {selectableData.length > 0 && (
        <div className="transition-all ease-in-out duration-500">
          <span>Selectable Inputs</span>
          <table>
            <thead>
              <th>Typed</th>
              <th>Countries</th>
              <th>Continent</th>
            </thead>
            <tbody>
              {data
                .filter((country: InputLine) => !country.exact)
                .map((country: InputLine) => (
                  <tr key={country.input}>
                    <td>{country.input}</td>
                    <td>
                      {country.exact ? (
                        country.official
                      ) : (
                        <CountrySelector
                          names={country.names}
                          dupString={country.input}
                          selectedIndex={country.selectedIndex}
                          onSelect={(idx) => handleSelectCountry(country.input, idx)}
                        />
                      )}
                    </td>
                    <td>
                      {country.continents.map((continent) => (
                        <div>{continent}</div>
                      ))}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <span>Output</span>
        <div className="flex" style={{ gap: 4 }}>
          <span>
            <input type="checkbox" />
            Convert to Official Name
          </span>
          <button 
            type="button" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
            onClick={handleDownload}
          >
            DOWNLOAD
          </button>
          <button 
            type="button" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
            onClick={handleCopy}
          >
            COPY
          </button>
        </div>
      </div>
      <textarea
        ref={outputRef}
        readOnly
        style={{
          width: "100%",
          height: `${data.length * 2}rem`,
          border: "solid 1px #ddd",
          padding: 1,
        }}
        value={data
          .map((country: InputLine) => {
            if (country.exact) {
              return `${country.input},${country.continents[0]}`;
            }

            if (country.selectedIndex == undefined) {
              return `${country.input},"Not Found"`;
            }
            return `${country.input},${country.continents[country.selectedIndex]}`;
          })
          .join("\n")}
      />
    </main>
  );
}
