import { useState } from 'react';
import { Button, Form, Modal } from "react-bootstrap";
import { readSheet } from 'read-excel-file/browser';
import { showToast } from '../utilities/toast';
import { parsePlayersRows, type ImportedPlayer, type ExcelRowError } from '../utilities/excelPlayers';
import API from "../API/API";
import Asta from '../entities/asta';

interface ImportPlayersFormProps {
  show: boolean;
  onHide: () => void;
  asta: Asta;
  asta_id: string | number;
  setDirty: (dirty: boolean) => void;
}

interface ImportPreview {
  fileName: string;
  players: ImportedPlayer[];
  outOfList: number;
  errors: ExcelRowError[];
  toImport: number;
  alreadyPresent: string[];
}

// Import di una lista giocatori da file Excel (colonne B nome, C fuori lista, D squadra, F ruolo, G ruolo mantra).
// Modal: scelto il file mostra un'anteprima (calcolata dal server in dry run) e importa solo dopo la conferma.
function ImportPlayersForm(props: ImportPlayersFormProps) {

  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  // cambiando la key si svuota l'input file dopo l'import o l'annullamento
  const [inputKey, setInputKey] = useState<number>(0);

  const reset = () => {
    setPreview(null);
    setShowDetails(false);
    setInputKey((k) => k + 1);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPreview(null);
    setShowDetails(false);
    if (!file) return;

    setIsReading(true);

    try {
      const rows = await readSheet(file);
      const parsed = parsePlayersRows(rows, props.asta.type);

      let toImport = 0;
      let alreadyPresent: string[] = [];

      if (parsed.players.length > 0) {
        const response = await API.importPlayers(Number(props.asta_id), parsed.players, true);
        if (!response.ok) {
          showToast.error("Failed to check the players to import");
          return;
        }
        const summary = await response.json();
        toImport = summary.to_import;
        alreadyPresent = summary.skipped;
      }

      setPreview({ fileName: file.name, ...parsed, toImport, alreadyPresent });
    } catch {
      showToast.error("Impossibile leggere il file Excel");
    } finally {
      setIsReading(false);
    }
  };

  const handleImport = async () => {
    if (!preview) return;
    setIsImporting(true);

    try {
      const response = await API.importPlayers(Number(props.asta_id), preview.players, false);

      if (response && response.ok) {
        const result = await response.json();
        showToast.success(
          `Importati ${result.imported} giocatori` +
          (result.skipped.length > 0 ? ` (${result.skipped.length} già presenti saltati)` : "")
        );
        reset();
        props.setDirty(true);
        props.onHide();
      } else {
        showToast.error("Failed to import the players");
      }
    } catch {
      showToast.error("Failed to import the players");
    } finally {
      setIsImporting(false);
    }
  };

  const close = () => {
    reset();
    props.onHide();
  };

  return (
    <Modal show={props.show} onHide={close} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Importa giocatori da Excel</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="import-excel-file" className="mb-3">
          <Form.Label className="small text-secondary">
            File .xlsx (colonne: B nome, C fuori lista, D squadra, F ruolo, G ruolo mantra). I giocatori vengono importati come non classificati.
          </Form.Label>
          <Form.Control
            key={inputKey}
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            disabled={isReading || isImporting}
          />
        </Form.Group>

        {isReading ? <p className="text-secondary mb-0">Lettura del file...</p> : <></>}

        {
          preview ?
            <>
              <ul className="mb-3">
                <li>Da importare: <strong>{preview.toImport}</strong> (come non classificati)</li>
                <li>Fuori lista (ignorati): {preview.outOfList}</li>
                <li>Già presenti nell&apos;asta (saltati): {preview.alreadyPresent.length}</li>
                <li className={preview.errors.length > 0 ? "text-warning" : ""}>
                  Righe con errori (ignorate): {preview.errors.length}
                </li>
              </ul>

              {
                (preview.alreadyPresent.length > 0 || preview.errors.length > 0) ?
                  <>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 mb-2 text-decoration-none"
                      onClick={() => setShowDetails((s) => !s)}
                    >
                      {showDetails ? "▴ Nascondi dettagli" : "▾ Mostra dettagli"}
                    </Button>
                    {
                      showDetails ?
                        <div className="small mb-1" style={{ maxHeight: 200, overflowY: "auto" }}>
                          {
                            preview.errors.map((e) => (
                              <div key={`err-${e.row}`} className="text-warning">Riga {e.row}: {e.reason}</div>
                            ))
                          }
                          {
                            preview.alreadyPresent.length > 0 ?
                              <div className="text-secondary">Già presenti: {preview.alreadyPresent.join(", ")}</div>
                              : <></>
                          }
                        </div>
                        : <></>
                    }
                  </>
                  : <></>
              }
            </>
            : <></>
        }
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={close} disabled={isImporting}>
          Annulla
        </Button>
        <Button
          variant="success"
          onClick={handleImport}
          disabled={!preview || isImporting || preview.toImport == 0}
        >
          {isImporting ? "Importando..." : `Importa ${preview?.toImport ?? 0} giocatori`}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ImportPlayersForm;
