import { villageSearchOptions } from "@/data/villages";

type VillageAutocompleteFieldProps = {
  id?: string;
  name?: string;
};

export function VillageAutocompleteField({
  id = "village-name",
  name = "villageName",
}: VillageAutocompleteFieldProps) {
  return (
    <div className="grid gap-2 text-sm font-medium text-[#334235]">
      <label htmlFor={id}>Název obce</label>
      <input
        id={id}
        name={name}
        type="text"
        list="village-autocomplete-options"
        placeholder="Začněte psát název obce..."
        className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3 outline-none transition placeholder:text-[#8a9385] focus:border-emerald-800/45 focus:bg-white"
      />
      <datalist id="village-autocomplete-options">
        {villageSearchOptions.map((option) => (
          <option key={option.slug} value={option.name} label={option.label} />
        ))}
      </datalist>
      <p className="text-xs leading-6 text-[#667062]">
        Zatím jde o lokální ukázková data. Později se pole napojí na RÚIAN nebo
        jiný ověřený veřejný registr a po výběru obce automaticky doplní okres,
        kraj i GPS souřadnice.
      </p>
      <div className="mt-2 border border-emerald-950/10 bg-white/52 p-3 text-xs leading-6 text-[#667062]">
        <p className="font-semibold uppercase tracking-[0.18em] text-emerald-800/70">
          Náhled budoucího automatického doplnění
        </p>
        <p className="mt-2">
          {villageSearchOptions[0]?.name}: {villageSearchOptions[0]?.detail}
          {villageSearchOptions[0]?.ruianCode
            ? ` · RÚIAN ${villageSearchOptions[0].ruianCode}`
            : ""}
        </p>
      </div>
    </div>
  );
}
