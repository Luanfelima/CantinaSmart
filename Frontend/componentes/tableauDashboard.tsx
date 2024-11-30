import React, { useEffect, useRef } from "react";

const TableauEmbed: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const divElement = containerRef.current;
      const vizElement = divElement.getElementsByTagName("object")[0];

      if (divElement.offsetWidth > 800) {
        vizElement.style.width = "1366px";
        vizElement.style.height = "795px";
      } else if (divElement.offsetWidth > 500) {
        vizElement.style.width = "1366px";
        vizElement.style.height = "795px";
      } else {
        vizElement.style.width = "100%";
        vizElement.style.height = "1727px";
      }

      const scriptElement = document.createElement("script");
      scriptElement.src = "https://public.tableau.com/javascripts/api/viz_v1.js";
      vizElement.parentNode?.insertBefore(scriptElement, vizElement);
    }
  }, []);

  return (
    <div
      className="tableauPlaceholder"
      id="viz1733004768836"
      style={{ position: "relative" }}
      ref={containerRef}
    >
      <noscript>
        <a href="#">
          <img
            alt="Acompanhamento de Vendas"
            src="https://public.tableau.com/static/images/Ac/AcompanhamentodeVendas_17330043848500/AcompanhamentodeVendas/1_rss.png"
            style={{ border: "none" }}
          />
        </a>
      </noscript>
      <object className="tableauViz" style={{ display: "none" }}>
        <param name="host_url" value="https%3A%2F%2Fpublic.tableau.com%2F" />
        <param name="embed_code_version" value="3" />
        <param name="site_root" value="" />
        <param
          name="name"
          value="AcompanhamentodeVendas_17330043848500/AcompanhamentodeVendas"
        />
        <param name="tabs" value="no" />
        <param name="toolbar" value="yes" />
        <param
          name="static_image"
          value="https://public.tableau.com/static/images/Ac/AcompanhamentodeVendas_17330043848500/AcompanhamentodeVendas/1.png"
        />
        <param name="animate_transition" value="yes" />
        <param name="display_static_image" value="yes" />
        <param name="display_spinner" value="yes" />
        <param name="display_overlay" value="yes" />
        <param name="display_count" value="yes" />
        <param name="language" value="pt-BR" />
        <param name="filter" value="publish=yes" />
      </object>
    </div>
  );
};

export default TableauEmbed;