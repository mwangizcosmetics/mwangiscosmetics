"use client";

import { Edit3, MapPinned, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useServiceLocationStore } from "@/lib/stores/service-location-store";
import { formatEtaRange } from "@/lib/utils/format";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

interface TownDraft {
  name: string;
  deliveryFee: string;
  etaMinValue: string;
  etaMaxValue: string;
  etaUnit: "hours" | "days";
}

const emptyTownDraft: TownDraft = {
  name: "",
  deliveryFee: "",
  etaMinValue: "",
  etaMaxValue: "",
  etaUnit: "days",
};

function toTownPayload(draft: TownDraft) {
  return {
    name: draft.name,
    deliveryFee: draft.deliveryFee ? Number(draft.deliveryFee) : null,
    etaMinValue: draft.etaMinValue ? Number(draft.etaMinValue) : null,
    etaMaxValue: draft.etaMaxValue ? Number(draft.etaMaxValue) : null,
    etaUnit: draft.etaUnit,
  };
}

export function ServiceLocationsManager() {
  const counties = useServiceLocationStore((state) => state.counties);
  const towns = useServiceLocationStore((state) => state.towns);
  const hasHydrated = useServiceLocationStore((state) => state.hasHydrated);
  const addCounty = useServiceLocationStore((state) => state.addCounty);
  const updateCounty = useServiceLocationStore((state) => state.updateCounty);
  const toggleCountyActive = useServiceLocationStore((state) => state.toggleCountyActive);
  const deleteCounty = useServiceLocationStore((state) => state.deleteCounty);
  const addTown = useServiceLocationStore((state) => state.addTown);
  const updateTown = useServiceLocationStore((state) => state.updateTown);
  const toggleTownActive = useServiceLocationStore((state) => state.toggleTownActive);
  const deleteTown = useServiceLocationStore((state) => state.deleteTown);

  const [searchValue, setSearchValue] = useState("");
  const [newCountyName, setNewCountyName] = useState("");
  const [townDrafts, setTownDrafts] = useState<Record<string, TownDraft>>({});
  const [editingCountyId, setEditingCountyId] = useState<string | null>(null);
  const [editingCountyName, setEditingCountyName] = useState("");
  const [editingTownId, setEditingTownId] = useState<string | null>(null);
  const [editingTownDraft, setEditingTownDraft] = useState<TownDraft>(emptyTownDraft);

  const townsByCounty = useMemo(() => {
    return towns.reduce<Record<string, typeof towns>>((accumulator, town) => {
      accumulator[town.countyId] = [...(accumulator[town.countyId] ?? []), town];
      return accumulator;
    }, {});
  }, [towns]);

  const filteredCounties = useMemo(() => {
    const query = normalize(searchValue);
    const sorted = [...counties].sort((a, b) => a.name.localeCompare(b.name));

    if (!query) {
      return sorted;
    }

    return sorted.filter((county) => {
      const countyMatch = normalize(county.name).includes(query);
      if (countyMatch) {
        return true;
      }

      const countyTowns = townsByCounty[county.id] ?? [];
      return countyTowns.some((town) => normalize(town.name).includes(query));
    });
  }, [counties, searchValue, townsByCounty]);

  const activeCounties = counties.filter((county) => county.isActive).length;
  const activeTowns = towns.filter((town) => town.isActive).length;

  if (!hasHydrated) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Service Locations</h2>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">Loading locations...</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Delivery Coverage</h2>
            <p className="text-sm text-[var(--foreground-muted)]">
              Manage active counties and towns used in checkout delivery pricing.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
            <span className="rounded-full bg-[var(--brand-100)] px-2 py-1 font-medium text-[var(--brand-900)]">
              Counties: {activeCounties}/{counties.length}
            </span>
            <span className="rounded-full bg-[var(--brand-100)] px-2 py-1 font-medium text-[var(--brand-900)]">
              Towns: {activeTowns}/{towns.length}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search county or town"
              className="h-10 rounded-xl pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Input
              value={newCountyName}
              onChange={(event) => setNewCountyName(event.target.value)}
              placeholder="Add county"
              className="h-10 rounded-xl"
            />
            <Button
              type="button"
              className="h-10 rounded-xl"
              onClick={() => {
                const result = addCounty(newCountyName);
                if (!result.ok) {
                  toast.error(result.message ?? "Unable to add county.");
                  return;
                }
                toast.success("County added.");
                setNewCountyName("");
              }}
            >
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {filteredCounties.map((county) => {
          const countyTowns = [...(townsByCounty[county.id] ?? [])].sort((a, b) =>
            a.name.localeCompare(b.name),
          );

          const countyDraft = townDrafts[county.id] ?? emptyTownDraft;

          return (
            <article
              key={county.id}
              className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPinned className="size-4 text-[var(--brand-700)]" />
                  {editingCountyId === county.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingCountyName}
                        onChange={(event) => setEditingCountyName(event.target.value)}
                        className="h-9 w-44 rounded-xl"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="h-9 rounded-xl"
                        onClick={() => {
                          const result = updateCounty(county.id, editingCountyName);
                          if (!result.ok) {
                            toast.error(result.message ?? "Unable to update county.");
                            return;
                          }
                          toast.success("County updated.");
                          setEditingCountyId(null);
                          setEditingCountyName("");
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold text-[var(--foreground)]">{county.name}</p>
                      <Badge variant={county.isActive ? "soft" : "outline"}>
                        {county.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-full"
                    onClick={() => {
                      if (editingCountyId === county.id) {
                        setEditingCountyId(null);
                        setEditingCountyName("");
                        return;
                      }

                      setEditingCountyId(county.id);
                      setEditingCountyName(county.name);
                    }}
                  >
                    <Edit3 className="size-3.5" />
                    {editingCountyId === county.id ? "Cancel" : "Edit"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-full"
                    onClick={() => {
                      toggleCountyActive(county.id);
                      toast.success(
                        county.isActive
                          ? `${county.name} disabled for checkout.`
                          : `${county.name} enabled for checkout.`,
                      );
                    }}
                  >
                    {county.isActive ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-full text-[#a11f2f] hover:bg-[#ffe8ec] hover:text-[#a11f2f]"
                    onClick={() => {
                      deleteCounty(county.id);
                      toast.success("County removed.");
                    }}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-5">
                <Input
                  value={countyDraft.name}
                  onChange={(event) =>
                    setTownDrafts((state) => ({
                      ...state,
                      [county.id]: {
                        ...(state[county.id] ?? emptyTownDraft),
                        name: event.target.value,
                      },
                    }))
                  }
                  placeholder={`Town/center in ${county.name}`}
                  className="h-9 rounded-xl sm:col-span-2"
                />
                <Input
                  value={countyDraft.deliveryFee}
                  onChange={(event) =>
                    setTownDrafts((state) => ({
                      ...state,
                      [county.id]: {
                        ...(state[county.id] ?? emptyTownDraft),
                        deliveryFee: event.target.value,
                      },
                    }))
                  }
                  placeholder="Fee"
                  type="number"
                  min={0}
                  className="h-9 rounded-xl"
                />
                <div className="flex gap-2">
                  <Input
                    value={countyDraft.etaMinValue}
                    onChange={(event) =>
                      setTownDrafts((state) => ({
                        ...state,
                        [county.id]: {
                          ...(state[county.id] ?? emptyTownDraft),
                          etaMinValue: event.target.value,
                        },
                      }))
                    }
                    placeholder="ETA min"
                    type="number"
                    min={1}
                    className="h-9 rounded-xl"
                  />
                  <Input
                    value={countyDraft.etaMaxValue}
                    onChange={(event) =>
                      setTownDrafts((state) => ({
                        ...state,
                        [county.id]: {
                          ...(state[county.id] ?? emptyTownDraft),
                          etaMaxValue: event.target.value,
                        },
                      }))
                    }
                    placeholder="ETA max"
                    type="number"
                    min={1}
                    className="h-9 rounded-xl"
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={countyDraft.etaUnit}
                    onValueChange={(value) =>
                      setTownDrafts((state) => ({
                        ...state,
                        [county.id]: {
                          ...(state[county.id] ?? emptyTownDraft),
                          etaUnit: value as "hours" | "days",
                        },
                      }))
                    }
                  >
                    <SelectTrigger className="h-9 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 rounded-xl"
                    onClick={() => {
                      const result = addTown(county.id, toTownPayload(countyDraft));
                      if (!result.ok) {
                        toast.error(result.message ?? "Unable to add town.");
                        return;
                      }
                      toast.success("Town added.");
                      setTownDrafts((state) => ({ ...state, [county.id]: emptyTownDraft }));
                    }}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {countyTowns.length ? (
                  countyTowns.map((town) => (
                    <div
                      key={town.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[var(--border)] bg-white p-3"
                    >
                      <div className="flex items-center gap-2">
                        {editingTownId === town.id ? (
                          <div className="grid gap-2 sm:grid-cols-5">
                            <Input
                              value={editingTownDraft.name}
                              onChange={(event) =>
                                setEditingTownDraft((state) => ({ ...state, name: event.target.value }))
                              }
                              className="h-8 rounded-xl sm:col-span-2"
                            />
                            <Input
                              value={editingTownDraft.deliveryFee}
                              onChange={(event) =>
                                setEditingTownDraft((state) => ({ ...state, deliveryFee: event.target.value }))
                              }
                              className="h-8 rounded-xl"
                              type="number"
                              min={0}
                            />
                            <div className="flex gap-2">
                              <Input
                                value={editingTownDraft.etaMinValue}
                                onChange={(event) =>
                                  setEditingTownDraft((state) => ({ ...state, etaMinValue: event.target.value }))
                                }
                                className="h-8 rounded-xl"
                                type="number"
                                min={1}
                              />
                              <Input
                                value={editingTownDraft.etaMaxValue}
                                onChange={(event) =>
                                  setEditingTownDraft((state) => ({ ...state, etaMaxValue: event.target.value }))
                                }
                                className="h-8 rounded-xl"
                                type="number"
                                min={1}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Select
                                value={editingTownDraft.etaUnit}
                                onValueChange={(value) =>
                                  setEditingTownDraft((state) => ({
                                    ...state,
                                    etaUnit: value as "hours" | "days",
                                  }))
                                }
                              >
                                <SelectTrigger className="h-8 rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hours">Hours</SelectItem>
                                  <SelectItem value="days">Days</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                size="sm"
                                className="h-8 rounded-xl"
                                onClick={() => {
                                  const result = updateTown(town.id, toTownPayload(editingTownDraft));
                                  if (!result.ok) {
                                    toast.error(result.message ?? "Unable to update town.");
                                    return;
                                  }
                                  toast.success("Town updated.");
                                  setEditingTownId(null);
                                  setEditingTownDraft(emptyTownDraft);
                                }}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-[var(--foreground)]">{town.name}</p>
                            <Badge variant={town.isActive ? "soft" : "outline"}>
                              {town.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-xs text-[var(--foreground-subtle)]">
                              {formatEtaRange(town.etaMinValue, town.etaMaxValue, town.etaUnit)}
                            </span>
                            <span className="text-xs text-[var(--foreground-subtle)]">
                              KES {town.deliveryFee ?? 0}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-full"
                          onClick={() => {
                            if (editingTownId === town.id) {
                              setEditingTownId(null);
                              setEditingTownDraft(emptyTownDraft);
                              return;
                            }

                            setEditingTownId(town.id);
                            setEditingTownDraft({
                              name: town.name,
                              deliveryFee: String(town.deliveryFee ?? ""),
                              etaMinValue: String(town.etaMinValue ?? ""),
                              etaMaxValue: String(town.etaMaxValue ?? ""),
                              etaUnit: town.etaUnit ?? "days",
                            });
                          }}
                        >
                          <Edit3 className="size-3.5" />
                          {editingTownId === town.id ? "Cancel" : "Edit"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 rounded-full"
                          onClick={() => {
                            toggleTownActive(town.id);
                            toast.success(
                              town.isActive
                                ? `${town.name} disabled.`
                                : `${town.name} enabled.`,
                            );
                          }}
                        >
                          {town.isActive ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 rounded-full text-[#a11f2f] hover:bg-[#ffe8ec] hover:text-[#a11f2f]"
                          onClick={() => {
                            deleteTown(town.id);
                            toast.success("Town removed.");
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-alt)] p-4 text-sm text-[var(--foreground-muted)]">
                    No towns or centers added yet.
                  </div>
                )}
              </div>
            </article>
          );
        })}

        {!filteredCounties.length ? (
          <div className="rounded-3xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-alt)] p-6 text-center">
            <p className="font-medium text-[var(--foreground)]">No matching locations found</p>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Try a different county/town search term.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}

