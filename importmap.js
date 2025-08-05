var createImportMap = (() => {
  const importMap = {
    "imports": {
      "main": `Main.mjs`,
      "ecs": `modules/ECS.js`,
      "helper": `modules/Helper.js`,
      "types": `modules/Types.js`,
      "vector2d": `modules/Vectors.js`,
      "components/": `componenets/`,
      "cr24/": `cr24/`
    }
  };

  return (baseURL) => {
    for (const mapping in importMap.imports) {
      importMap.imports[mapping] = `${baseURL}/${importMap.imports[mapping]}`;
    }

    const script = document.createElement("script");
    script.type = "importmap";
    script.textContent = JSON.stringify(importMap);
    document.head.appendChild(script);
  };
})();
