"use client";
import { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";

export default function Global() {
  const [nbcol, setNbcol] = useState("");
  const [nbligne, setNbligne] = useState("");
  const [nomservice, setNomservice] = useState("");
  const [logo, setLogo] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [savedTables, setSavedTables] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  useEffect(() => {
    const storedTables = JSON.parse(localStorage.getItem("saved_tables")) || [];
    setSavedTables(storedTables);

    const firstVisit = localStorage.getItem("first_visit");
    if (!firstVisit) {
      setShowMessage(true);
      localStorage.setItem("first_visit", "true");
      setTimeout(() => setShowMessage(false), 5000);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const lignes = isNaN(parseInt(nbligne)) ? 0 : parseInt(nbligne);
  const colonnes = isNaN(parseInt(nbcol)) ? 0 : parseInt(nbcol);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    const data = document.getElementById("table-container")?.innerHTML;
    if (data) {
      const newTable = { nomservice, table: data, logo };
      let updatedTables;
      if (editingTable !== null) {
        updatedTables = [...savedTables];
        updatedTables[editingTable] = newTable;
        setEditingTable(null);
      } else {
        updatedTables = [...savedTables, newTable];
      }
      localStorage.setItem("saved_tables", JSON.stringify(updatedTables));
      setSavedTables(updatedTables);
      alert("Tableau sauvegardé !");
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById("pdf-area");
    if (element) {
      const opt = {
        margin: 0.5,
        filename: '${nomservice}_tableau.pdf',
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  const handleClearSavedTables = () => {
    localStorage.removeItem("saved_tables");
    setSavedTables([]);
  };

  return submitted ? (
    <div className="p-8 bg-white min-h-screen flex flex-col items-center">
      {showMessage && (
        <div className="absolute top-4 bg-blue-500 text-white text-center px-6 py-3 rounded-lg shadow-lg transition-opacity duration-500">
          🎉 Bienvenue ! Voici ce que vous pouvez faire :
          <br />🔹 Créer un tableau dynamique
          <br />🔹 Sauvegarder vos tableaux
          <br />🔹 Télécharger en PDF
          <br />🔹 Modifier vos tableaux existants
          <button
            onClick={() => setShowMessage(false)}
            className="ml-4 bg-white text-blue-500 px-3 py-1 rounded shadow"
          >
            Fermer
          </button>
        </div>
      )}

      <div id="pdf-area" className="w-full max-w-3xl text-center">
        {logo && (
          <img
            src={logo}
            alt="Logo"
            className="h-24 w-24 rounded-full mx-auto object-cover mb-4"
          />
        )}
        <h1 className="text-3xl font-bold mb-6">{nomservice}</h1>

        <div id="table-container" className="overflow-auto mb-6">
          <table className="table-auto border border-black w-full">
            <tbody>
              {Array.from({ length: lignes }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {Array.from({ length: colonnes }).map((_, colIdx) => (
                    <td key={colIdx} className="border border-black p-3">
                      <input
                        type="text"
                        className="w-full p-2 outline-none text-center"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={handlePrint}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          Imprimer
        </button>
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Sauvegarder
        </button>
        <button
          onClick={handleDownloadPDF}
          className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
        >
          Télécharger en PDF
        </button>
        <button
          onClick={() => {
            setSubmitted(false);
            setEditingTable(null);
          }}
          className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
        >
          {editingTable !== null ? "Annuler la modification" : "Modifier"}
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">Tableaux sauvegardés</h2>
      <div className="w-full max-w-3xl mb-6">
        {savedTables.length > 0 ? (
          savedTables.map((table, index) => (
            <div
              key={index}
              className="bg-white shadow-lg p-4 rounded-lg mb-4 text-center"
            >
              {table.logo && (
                <img
                  src={table.logo}
                  alt="Logo"
                  className="h-16 w-16 rounded-full mx-auto mb-2 object-cover"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{table.nomservice}</h3>
              <div dangerouslySetInnerHTML={{ __html: table.table }} />
              <button
                onClick={() => {
                  setNomservice(table.nomservice);
                  setLogo(table.logo);
                  const tempContainer = document.createElement("div");
                  tempContainer.innerHTML = table.table;
                  const rows = tempContainer.querySelectorAll("tr").length;
                  const cols = tempContainer.querySelectorAll("tr:first-child td").length;
                  setNbcol(cols.toString());
                  setNbligne(rows.toString());
                  setEditingTable(index);
                  setSubmitted(true);
                }}
                className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Modifier ce tableau
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Aucun tableau sauvegardé</p>
        )}
        <button
          onClick={handleClearSavedTables}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Supprimer tous les tableaux
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg flex flex-col space-y-8 p-6 rounded-lg w-full max-w-md text-center"
      >
        <div className="flex flex-col space-y-4">
          <input
            type="number"
            required
            value={nbcol}
            onChange={(e) => setNbcol(e.target.value)}
            placeholder="Nombre de colonnes..."
            className="border border-black p-3 rounded text-center hover:bg-gray-100"
          />
          <input
            type="number"
            required
            value={nbligne}
            onChange={(e) => setNbligne(e.target.value)}
            placeholder="Nombre de lignes..."
            className="border border-black p-3 rounded text-center hover:bg-gray-100"
          />
        </div>
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            required
            value={nomservice}
            onChange={(e) => setNomservice(e.target.value)}
            placeholder="Nom de la société..."
            className="border border-black p-3 rounded text-center hover:bg-gray-100"
          />
          <input
            type="file"
            accept="image/*"
            required={!logo}
            onChange={(e) => {
              const reader = new FileReader();
              reader.onload = () => setLogo(reader.result);
              reader.readAsDataURL(e.target.files[0]);
            }}
            className="border border-black p-3 rounded hover:bg-gray-100"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Générer le tableau
        </button>
      </form>
    </div>
  );
}