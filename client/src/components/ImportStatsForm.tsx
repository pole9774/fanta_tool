import { useRef, useState } from 'react';
import { Button, Form, Modal } from "react-bootstrap";
import { readSheet } from 'read-excel-file/browser';
import { showToast } from '../utilities/toast';
import { parseStatsRows, STATS_SEASONS, type ParsedStats } from '../utilities/excelStats';
import API from "../API/API";

interface ImportStatsFormProps {
  show: boolean;
  onHide: () => void;
  asta_id: string | number;
  setDirty: (dirty: boolean) => void;
}

interface ParsedFile extends ParsedStats {
  fileName: string;
}

// Riepilogo restituito dal server (dry run)
interface StatsPreview {
  to_update: number;
  skipped_with_notes: number;
  not_in_file: number;
  file_not_in_asta: number;
  examples: { name: string, notes: string }[];
}

// Modal: import delle statistiche di una stagione (file "Statistiche Fantacalcio", primo foglio) nelle note dei
// giocatori che non hanno ancora note. Scelti stagione e file mostra un'anteprima e scrive solo dopo la conferma.
function ImportStatsForm(props: ImportStatsFormProps) {

  const [season, setSeason] = useState<string>("");
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [preview, setPreview] = useState<StatsPreview | null>(null);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  // cambiando la key si svuota l'input file dopo l'import o l'annullamento
  const [inputKey, setInputKey] = useState<number>(0);
  // ignora le risposte di anteprime superate (es. cambio stagione mentre una richiesta è in corso)
  const previewRequest = useRef<number>(0);

  const reset = () => {
    setSeason("");
    setParsed(null);
    setPreview(null);
    setShowDetails(false);
    setInputKey((k) => k + 1);
  };

  const close = () => {
    reset();
    props.onHide();
  };

  // Anteprima dal server: richiede sia la stagione sia almeno un giocatore letto dal file
  const runPreview = async (file: ParsedFile | null, selectedSeason: string) => {
    const request = ++previewRequest.current;
    setPreview(null);
    if (!file || selectedSeason == "" || file.stats.length == 0) return;

    try {
      const response = await API.importStatsNotes(Number(props.asta_id), selectedSeason, file.stats, true);
      if (request != previewRequest.current) return;
      if (!response.ok) {
        showToast.error("Failed to check the statistics to import");
        return;
      }
      setPreview(await response.json());
    } catch {
      showToast.error("Failed to check the statistics to import");
    }
  };

  const handleSeasonChange = (value: string) => {
    setSeason(value);
    runPreview(parsed, value);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setParsed(null);
    setPreview(null);
    setShowDetails(false);
    if (!file) return;

    setIsReading(true);

    try {
      // primo foglio del file ("Tutti")
      const rows = await readSheet(file);
      const parsedFile: ParsedFile = { fileName: file.name, ...parseStatsRows(rows) };
      setParsed(parsedFile);
      await runPreview(parsedFile, season);
    } catch {
      showToast.error("Impossibile leggere il file Excel");
    } finally {
      setIsReading(false);
    }
  };

  const handleImport = async () => {
    if (!parsed || !preview || season == "") return;
    setIsImporting(true);

    try {
      const response = await API.importStatsNotes(Number(props.asta_id), season, parsed.stats, false);

      if (response && response.ok) {
        const result = await response.json();
        showToast.success(`Note aggiornate per ${result.updated} giocatori`);
        props.setDirty(true);
        close();
      } else {
        showToast.error("Failed to import the statistics");
      }
    } catch {
      showToast.error("Failed to import the statistics");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal show={props.show} onHide={close} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Importa statistiche nelle note</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-grid gap-3 mb-3" style={{ gridTemplateColumns: "1fr 2fr" }}>
          <Form.Group controlId="import-stats-season">
            <Form.Label className="small text-secondary">Stagione</Form.Label>
            <Form.Select
              value={season}
              onChange={(e) => handleSeasonChange(e.target.value)}
              disabled={isImporting}
            >
              <option value="">Scegli la stagione...</option>
              {STATS_SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="import-stats-file">
            <Form.Label className="small text-secondary">File .xlsx delle statistiche (primo foglio)</Form.Label>
            <Form.Control
              key={inputKey}
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              disabled={isReading || isImporting}
            />
          </Form.Group>
        </div>

        <p className="small text-secondary">
          Le statistiche vengono scritte solo nelle note dei giocatori che non hanno ancora note.
        </p>

        {isReading ? <p className="text-secondary mb-0">Lettura del file...</p> : <></>}

        {
          parsed && season == "" ?
            <p className="text-warning mb-0">Scegli la stagione per vedere l&apos;anteprima.</p>
            : <></>
        }

        {
          parsed && preview ?
            <>
              <ul className="mb-3">
                <li>Note da aggiornare: <strong>{preview.to_update}</strong></li>
                <li>Giocatori con note già presenti (saltati): {preview.skipped_with_notes}</li>
                <li>Giocatori dell&apos;asta non presenti nel file: {preview.not_in_file}</li>
                <li>Giocatori del file non presenti nell&apos;asta (ignorati): {preview.file_not_in_asta}</li>
                <li className={parsed.errors.length > 0 ? "text-warning" : ""}>
                  Righe del file con errori (ignorate): {parsed.errors.length}
                </li>
              </ul>

              {
                preview.examples.length > 0 ?
                  <div className="small mb-3">
                    <div className="text-secondary mb-1">Esempi:</div>
                    {
                      preview.examples.map((e) => (
                        <div key={e.name}><strong>{e.name}</strong>: {e.notes}</div>
                      ))
                    }
                  </div>
                  : <></>
              }

              {
                parsed.errors.length > 0 ?
                  <>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 mb-2 text-decoration-none"
                      onClick={() => setShowDetails((s) => !s)}
                    >
                      {showDetails ? "▴ Nascondi errori" : "▾ Mostra errori"}
                    </Button>
                    {
                      showDetails ?
                        <div className="small mb-1" style={{ maxHeight: 200, overflowY: "auto" }}>
                          {
                            parsed.errors.map((e) => (
                              <div key={`err-${e.row}`} className="text-warning">Riga {e.row}: {e.reason}</div>
                            ))
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
          disabled={!preview || isImporting || preview.to_update == 0 || season == ""}
        >
          {isImporting ? "Aggiornando..." : `Aggiorna ${preview?.to_update ?? 0} note`}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ImportStatsForm;
