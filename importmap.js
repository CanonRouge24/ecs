var createImportMap = (() => {
  const importMap = {
    "imports": {
      "main": `Main.mjs`,
      "ecs": `modules/ECS.mjs`,
      "helper": `modules/Helper.mjs`,
      "types": `modules/Types.mjs`,
      "vector2d": `modules/Vector.mjs`,
      "components/": `componenets/`,
      "cr24/": `cr24/`
    }
  };

  return (baseURL) => {
    for (const mapping in importMap.imports) {
      importMap.imports[mapping] = `${baseURL}${importMap.imports[mapping]}`;
    }

    const script = document.createElement("script");
    script.type = "importmap";
    script.textContent = JSON.stringify(importMap);

    return script;
  };
})();
