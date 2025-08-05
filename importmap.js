function createImportMap (baseURL)
{
  const importMap = {
    "imports": {
      "ecs": `${baseURL}/modules/ECS.js`,
      "helper": `${baseURL}/modules/Helper.js`,
      "types": `${baseURL}/modules/Types.js`,
      "vector2d": `${baseURL}/modules/Vectors.js`,
      "components/": `${baseURL}/componenets/`,
      "cr24/": `${baseURL}/cr24/`
    }
  };

  const script = document.createElement("script");
  script.type = "importmap";
  script.textContent = JSON.stringify(importMap);
  document.head.appendChild(script);
}
