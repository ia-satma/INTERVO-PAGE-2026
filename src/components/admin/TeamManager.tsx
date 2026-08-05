"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowSquareOut,
  ArrowUp,
  Check,
  CloudArrowUp,
  FloppyDisk,
  ImageSquare,
  Plus,
  Trash,
  Users,
  WarningCircle,
} from "@phosphor-icons/react";
import { csrfHeaders } from "@/lib/client/csrf";
import { buildChangeSet } from "@/lib/client/change-set";
import ChangeReviewDialog from "./ChangeReviewDialog";
import MediaPickerDialog from "./MediaPickerDialog";

type JsonRecord = Record<string, unknown>;
type OrganizationMember = {
  id: string;
  name: string;
  photo?: string;
  roleEs: string;
  roleEn: string;
  practiceAreaIds: string[];
  specialtiesEs: string[];
  specialtiesEn: string[];
  bioEs?: string;
  bioEn?: string;
  chambers?: string;
  managing?: boolean;
  visible: boolean;
  email?: string;
  phoneDisplay?: string;
  phoneHref?: string;
  linkedin?: string;
};
type Organization = {
  partners: OrganizationMember[];
  lawyers: OrganizationMember[];
  interns: OrganizationMember[];
  administration: OrganizationMember[];
};
type Partner = {
  id: string;
  name: string;
  roleEs: string;
  roleEn: string;
  practiceAreaIds: string[];
  specialtiesEs: string[];
  specialtiesEn: string[];
  bioEs: string;
  bioEn: string;
  chambers: string;
  managing: boolean;
  visible: boolean;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  photo: string;
  cardPhoto: string;
  linkedin: string;
};
type CmsDocument = {
  key: string;
  data: JsonRecord;
  published: JsonRecord;
  version: number;
};
type GroupKey = "lawyers" | "interns" | "administration";
type CategoryKey = "partners" | GroupKey;
type PracticeAreaOption = {
  id: string;
  labelEs: string;
  labelEn: string;
};

const groupLabels: Record<CategoryKey, string> = {
  partners: "Socio",
  lawyers: "Asociados",
  interns: "Pasantes",
  administration: "Administración",
};
const additionalGroupKeys: GroupKey[] = ["lawyers", "interns", "administration"];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 outline-none transition-[border-color,box-shadow] focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function strings(value: unknown) {
  return list(value).map((item) => text(item)).filter(Boolean);
}

function normalizeLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function buildPracticeAreaOptions(siteDocument: CmsDocument, navigationDocument: CmsDocument): PracticeAreaOption[] {
  const site = record(siteDocument.data);
  const navEs = record(record(navigationDocument.data).es);
  const navEn = record(record(navigationDocument.data).en);
  const servicesEs = record(navEs.services);
  const servicesEn = record(navEn.services);
  const featuredEs = record(servicesEs.featured);
  const featuredEn = record(servicesEn.featured);
  const otherEs = record(servicesEs.other);
  const otherEn = record(servicesEn.other);
  const configuredIds = [...strings(site.featuredServices), ...strings(site.otherServices)];
  const discoveredIds = [
    ...Object.keys(featuredEs),
    ...Object.keys(featuredEn),
    ...Object.keys(otherEs),
    ...Object.keys(otherEn),
  ];
  const ids = Array.from(new Set([...configuredIds, ...discoveredIds]));

  return ids.flatMap((id) => {
    const featuredEsItem = record(featuredEs[id]);
    const featuredEnItem = record(featuredEn[id]);
    const labelEs = text(featuredEsItem.title) || text(otherEs[id]);
    const labelEn = text(featuredEnItem.title) || text(otherEn[id]) || labelEs;
    return labelEs ? [{ id, labelEs, labelEn }] : [];
  });
}

function inferPracticeAreaIds(
  configured: unknown,
  specialtiesEs: string[],
  specialtiesEn: string[],
  options: PracticeAreaOption[],
) {
  const stored = strings(configured).filter((id) => options.some((option) => option.id === id));
  if (stored.length > 0) return stored;
  const labels = new Set([...specialtiesEs, ...specialtiesEn].map(normalizeLabel));
  return options
    .filter((option) => labels.has(normalizeLabel(option.labelEs)) || labels.has(normalizeLabel(option.labelEn)))
    .map((option) => option.id);
}

function extraSpecialties(values: string[], options: PracticeAreaOption[]) {
  const known = new Set(options.flatMap((option) => [option.labelEs, option.labelEn]).map(normalizeLabel));
  return values.filter((value) => !known.has(normalizeLabel(value)));
}

function mergePracticeAreas(ids: string[], extras: string[], options: PracticeAreaOption[], locale: "es" | "en") {
  return [
    ...ids.flatMap((id) => {
      const option = options.find((candidate) => candidate.id === id);
      return option ? [locale === "es" ? option.labelEs : option.labelEn] : [];
    }),
    ...extras.map((item) => item.trim()).filter(Boolean),
  ];
}

function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "nuevo-integrante"
  );
}

function uniqueId(name: string, used: string[]) {
  const base = slugify(name);
  if (!used.includes(base)) return base;
  let index = 2;
  while (used.includes(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

function buildPartners(
  siteDocument: CmsDocument,
  navigationDocument: CmsDocument,
  practiceAreas: PracticeAreaOption[],
): Partner[] {
  const site = record(siteDocument.data);
  const navEs = record(record(navigationDocument.data).es);
  const navEn = record(record(navigationDocument.data).en);
  const profilesEs = record(navEs.partners);
  const profilesEn = record(navEn.partners);

  return list(site.partners).map((value) => {
    const partner = record(value);
    const id = text(partner.id);
    const es = record(profilesEs[id]);
    const en = record(profilesEn[id]);
    const specialtiesEs = strings(es.specialties);
    const specialtiesEn = strings(en.specialties);
    return {
      id,
      name: text(partner.name, "Nuevo abogado"),
      roleEs: text(es.role, "Socio"),
      roleEn: text(en.role, "Partner"),
      practiceAreaIds: inferPracticeAreaIds(partner.practiceAreaIds, specialtiesEs, specialtiesEn, practiceAreas),
      specialtiesEs,
      specialtiesEn,
      bioEs: text(es.bio),
      bioEn: text(en.bio),
      chambers: text(partner.chambers),
      managing: Boolean(partner.managing),
      visible: partner.visible !== false,
      email: text(partner.email),
      phoneDisplay: text(partner.phoneDisplay),
      phoneHref: text(partner.phoneHref),
      photo: text(partner.photo),
      cardPhoto: text(partner.cardPhoto),
      linkedin: text(partner.linkedin),
    };
  });
}

function buildOrganization(siteDocument: CmsDocument, practiceAreas: PracticeAreaOption[]): Organization {
  const source = record(record(siteDocument.data).organization);
  const normalize = (key: keyof Organization) =>
    list(source[key]).map((value) => {
      const member = record(value);
      const specialtiesEs = strings(member.specialtiesEs);
      const specialtiesEn = strings(member.specialtiesEn);
      return {
        id: text(member.id),
        name: text(member.name),
        photo: text(member.photo) || undefined,
        roleEs: text(member.roleEs),
        roleEn: text(member.roleEn),
        practiceAreaIds: inferPracticeAreaIds(
          member.practiceAreaIds,
          specialtiesEs,
          specialtiesEn,
          practiceAreas,
        ),
        specialtiesEs,
        specialtiesEn,
        bioEs: text(member.bioEs) || undefined,
        bioEn: text(member.bioEn) || undefined,
        chambers: text(member.chambers) || undefined,
        managing: Boolean(member.managing),
        visible: member.visible !== false,
        email: text(member.email) || undefined,
        phoneDisplay: text(member.phoneDisplay) || undefined,
        phoneHref: text(member.phoneHref) || undefined,
        linkedin: text(member.linkedin) || undefined,
      };
    });
  return {
    partners: normalize("partners"),
    lawyers: normalize("lawyers"),
    interns: normalize("interns"),
    administration: normalize("administration"),
  };
}

function PhotoField({ value, name, label = "Fotografía", help, onChange }: { value: string; name: string; label?: string; help?: string; onChange: (value: string) => void }) {
  const [picker, setPicker] = useState(false);
  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[112px_1fr] sm:items-center">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white">
        {value ? (
          <Image src={value} alt={name} fill unoptimized className="object-cover object-top" />
        ) : (
          <span className="grid h-full w-full place-items-center text-slate-300">
            <ImageSquare size={32} />
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-700">{label}</p>
        {help && <p className="mt-1 text-xs leading-relaxed text-slate-500">{help}</p>}
        <p className="mt-1 break-all text-xs text-slate-500">{value || "Sin fotografía asignada"}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPicker(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0f4386] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0072ad]"
          >
            <ImageSquare size={17} /> Subir o elegir imagen
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="min-h-10 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:text-rose-700"
            >
              Quitar
            </button>
          )}
        </div>
      </div>
      <MediaPickerDialog open={picker} kind="image" onClose={() => setPicker(false)} onSelect={onChange} allowUpload />
    </div>
  );
}

function CompactPhotoField({ value, name, onChange }: { value: string; name: string; onChange: (value: string) => void }) {
  const [picker, setPicker] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setPicker(true)}
        aria-label={`Cambiar fotografía de ${name}`}
        className="relative h-[72px] w-[72px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-slate-400 hover:border-sky-600"
      >
        {value ? (
          <Image src={value} alt="" fill unoptimized className="object-cover object-top" />
        ) : (
          <span className="grid h-full w-full place-items-center"><ImageSquare size={24} /></span>
        )}
      </button>
      <MediaPickerDialog open={picker} kind="image" onClose={() => setPicker(false)} onSelect={onChange} allowUpload />
    </>
  );
}

function StringList({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">{label}</label>
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900"
        >
          <Plus size={14} weight="bold" /> Añadir área
        </button>
      </div>
      <div className="space-y-2">
        {values.length === 0 && (
          <button
            type="button"
            onClick={() => onChange([""])}
            className="w-full rounded-xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500 hover:border-sky-600 hover:text-sky-800"
          >
            Añadir la primera área de práctica
          </button>
        )}
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={value}
              onChange={(event) => onChange(values.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
              className={inputClass}
            />
            <button
              type="button"
              aria-label="Eliminar área"
              onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50"
            >
              <Trash size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PracticeAreaSelector({
  options,
  selectedIds,
  onChange,
}: {
  options: PracticeAreaOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <fieldset className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <legend className="text-sm font-semibold text-slate-800">Áreas de práctica</legend>
          <p className="mt-1 text-xs text-slate-500">
            Selecciona todas las áreas a las que pertenece. Los nombres ES/EN vienen del catálogo de Servicios.
          </p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 font-mono text-[0.68rem] font-semibold text-slate-500">
          {selectedIds.length} seleccionada{selectedIds.length === 1 ? "" : "s"}
        </span>
      </div>
      {options.length === 0 ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No hay áreas configuradas. Agrégalas primero en Servicios.
        </p>
      ) : (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {options.map((option) => {
            const checked = selectedIds.includes(option.id);
            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
                  checked ? "border-sky-700 bg-sky-50" : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    onChange(
                      checked
                        ? selectedIds.filter((id) => id !== option.id)
                        : [...selectedIds, option.id],
                    )
                  }
                  className="mt-0.5 h-4 w-4 shrink-0 accent-sky-700"
                />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-slate-800">{option.labelEs}</span>
                  <span className="mt-0.5 block text-[0.68rem] leading-snug text-slate-500">{option.labelEn}</span>
                </span>
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}

export default function TeamManager({
  siteDocument,
  navigationDocument,
  canPublish,
}: {
  siteDocument: CmsDocument;
  navigationDocument: CmsDocument;
  canPublish: boolean;
}) {
  const practiceAreas = useMemo(
    () => buildPracticeAreaOptions(siteDocument, navigationDocument),
    [navigationDocument, siteDocument],
  );
  const initialPartners = useMemo(
    () => buildPartners(siteDocument, navigationDocument, practiceAreas),
    [navigationDocument, practiceAreas, siteDocument],
  );
  const initialOrganization = useMemo(
    () => buildOrganization(siteDocument, practiceAreas),
    [practiceAreas, siteDocument],
  );
  const publishedSiteDocument = useMemo(
    () => ({ ...siteDocument, data: siteDocument.published }),
    [siteDocument],
  );
  const publishedNavigationDocument = useMemo(
    () => ({ ...navigationDocument, data: navigationDocument.published }),
    [navigationDocument],
  );
  const initialPublishedPartners = useMemo(
    () => buildPartners(publishedSiteDocument, publishedNavigationDocument, practiceAreas),
    [practiceAreas, publishedNavigationDocument, publishedSiteDocument],
  );
  const initialPublishedOrganization = useMemo(
    () => buildOrganization(publishedSiteDocument, practiceAreas),
    [practiceAreas, publishedSiteDocument],
  );
  const [partners, setPartners] = useState<Partner[]>(() => clone(initialPartners));
  const [organization, setOrganization] = useState<Organization>(() => clone(initialOrganization));
  const [savedPartners, setSavedPartners] = useState<Partner[]>(() => clone(initialPartners));
  const [savedOrganization, setSavedOrganization] = useState<Organization>(() => clone(initialOrganization));
  const [publishedPartners, setPublishedPartners] = useState<Partner[]>(() => clone(initialPublishedPartners));
  const [publishedOrganization, setPublishedOrganization] = useState<Organization>(() => clone(initialPublishedOrganization));
  const [selectedId, setSelectedId] = useState(initialPartners[0]?.id ?? "");
  const [group, setGroup] = useState<GroupKey>("lawyers");
  const [pending, setPending] = useState<"save" | "publish" | "">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [review, setReview] = useState<"save" | "publish" | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Partner | null>(null);

  const selected = partners.find((partner) => partner.id === selectedId);
  const dirty =
    JSON.stringify(partners) !== JSON.stringify(savedPartners) ||
    JSON.stringify(organization) !== JSON.stringify(savedOrganization);
  const reviewChanges = useMemo(
    () => review ? buildChangeSet(
      review === "publish"
        ? { partners: publishedPartners, organization: publishedOrganization }
        : { partners: savedPartners, organization: savedOrganization },
      { partners, organization },
    ) : [],
    [organization, partners, publishedOrganization, publishedPartners, review, savedOrganization, savedPartners],
  );

  function updatePartner(changes: Partial<Partner>) {
    setPartners((current) =>
      current.map((partner) => (partner.id === selectedId ? { ...partner, ...changes } : partner)),
    );
  }

  function addPartner() {
    const id = uniqueId("nuevo-abogado", partners.map((partner) => partner.id));
    const next: Partner = {
      id,
      name: "Nuevo abogado",
      roleEs: "Socio",
      roleEn: "Partner",
      practiceAreaIds: [],
      specialtiesEs: [],
      specialtiesEn: [],
      bioEs: "",
      bioEn: "",
      chambers: "",
      managing: false,
      visible: true,
      email: "",
      phoneDisplay: "",
      phoneHref: "",
      photo: "",
      cardPhoto: "",
      linkedin: "",
    };
    setPartners((current) => [...current, next]);
    setSelectedId(id);
  }

  function removePartner() {
    if (!removeTarget) return;
    const remaining = partners.filter((partner) => partner.id !== removeTarget.id);
    setPartners(remaining);
    setSelectedId(remaining[0]?.id ?? "");
    setRemoveTarget(null);
  }

  function movePartner(direction: -1 | 1) {
    const index = partners.findIndex((partner) => partner.id === selectedId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= partners.length) return;
    const next = [...partners];
    [next[index], next[target]] = [next[target], next[index]];
    setPartners(next);
  }

  function addMember(targetGroup: GroupKey) {
    const id = uniqueId(`nuevo-${targetGroup}`, [
      ...partners,
      ...organization.lawyers,
      ...organization.interns,
      ...organization.administration,
    ].map((member) => member.id));
    setOrganization((current) => ({
      ...current,
      [targetGroup]: [
        ...current[targetGroup],
        {
          id,
          name: "Nuevo integrante",
          roleEs: targetGroup === "lawyers" ? "Asociado" : groupLabels[targetGroup].replace(/s$/, ""),
          roleEn: targetGroup === "lawyers" ? "Associate" : targetGroup === "interns" ? "Intern" : "Administration",
          practiceAreaIds: [],
          specialtiesEs: [],
          specialtiesEn: [],
          visible: true,
        },
      ],
    }));
  }

  function updateMember(targetGroup: GroupKey, index: number, changes: Partial<OrganizationMember>) {
    setOrganization((current) => ({
      ...current,
      [targetGroup]: current[targetGroup].map((member, memberIndex) =>
        memberIndex === index ? { ...member, ...changes } : member,
      ),
    }));
  }

  function moveMember(targetGroup: GroupKey, index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= organization[targetGroup].length) return;
    const next = [...organization[targetGroup]];
    [next[index], next[target]] = [next[target], next[index]];
    setOrganization((current) => ({ ...current, [targetGroup]: next }));
  }

  function updatePartnerPracticeAreas(ids: string[]) {
    if (!selected) return;
    updatePartner({
      practiceAreaIds: ids,
      specialtiesEs: mergePracticeAreas(
        ids,
        extraSpecialties(selected.specialtiesEs, practiceAreas),
        practiceAreas,
        "es",
      ),
      specialtiesEn: mergePracticeAreas(
        ids,
        extraSpecialties(selected.specialtiesEn, practiceAreas),
        practiceAreas,
        "en",
      ),
    });
  }

  function updateMemberPracticeAreas(targetGroup: GroupKey, index: number, ids: string[]) {
    const member = organization[targetGroup][index];
    if (!member) return;
    updateMember(targetGroup, index, {
      practiceAreaIds: ids,
      specialtiesEs: mergePracticeAreas(
        ids,
        extraSpecialties(member.specialtiesEs, practiceAreas),
        practiceAreas,
        "es",
      ),
      specialtiesEn: mergePracticeAreas(
        ids,
        extraSpecialties(member.specialtiesEn, practiceAreas),
        practiceAreas,
        "en",
      ),
    });
  }

  function movePartnerToGroup(partner: Partner, targetGroup: GroupKey) {
    const member: OrganizationMember = {
      id: partner.id,
      name: partner.name,
      photo: partner.photo || undefined,
      roleEs: partner.roleEs,
      roleEn: partner.roleEn,
      practiceAreaIds: partner.practiceAreaIds,
      specialtiesEs: partner.specialtiesEs,
      specialtiesEn: partner.specialtiesEn,
      bioEs: partner.bioEs || undefined,
      bioEn: partner.bioEn || undefined,
      chambers: partner.chambers || undefined,
      managing: partner.managing,
      visible: partner.visible,
      email: partner.email || undefined,
      phoneDisplay: partner.phoneDisplay || undefined,
      phoneHref: partner.phoneHref || undefined,
      linkedin: partner.linkedin || undefined,
    };
    const remaining = partners.filter((candidate) => candidate.id !== partner.id);
    setPartners(remaining);
    setOrganization((current) => ({
      ...current,
      [targetGroup]: [...current[targetGroup], member],
    }));
    setSelectedId(remaining[0]?.id ?? "");
    setGroup(targetGroup);
  }

  function moveMemberCategory(sourceGroup: GroupKey, index: number, target: CategoryKey) {
    const member = organization[sourceGroup][index];
    if (!member || target === sourceGroup) return;
    setOrganization((current) => ({
      ...current,
      [sourceGroup]: current[sourceGroup].filter((_, memberIndex) => memberIndex !== index),
      ...(target === "partners"
        ? {}
        : { [target]: [...current[target], member] }),
    }));
    if (target === "partners") {
      const partner: Partner = {
        id: member.id,
        name: member.name,
        roleEs: member.roleEs || "Socio",
        roleEn: member.roleEn || "Partner",
        practiceAreaIds: member.practiceAreaIds,
        specialtiesEs: member.specialtiesEs,
        specialtiesEn: member.specialtiesEn,
        bioEs: member.bioEs ?? "",
        bioEn: member.bioEn ?? "",
        chambers: member.chambers ?? "",
        managing: Boolean(member.managing),
        visible: member.visible,
        email: member.email ?? "",
        phoneDisplay: member.phoneDisplay ?? "",
        phoneHref: member.phoneHref ?? "",
        photo: member.photo ?? "",
        cardPhoto: member.photo ?? "",
        linkedin: member.linkedin ?? "",
      };
      setPartners((current) => [...current, partner]);
      setSelectedId(partner.id);
    } else {
      setGroup(target);
    }
  }

  async function putDocument(key: string, data: JsonRecord) {
    const response = await fetch(`/api/admin/documents/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify({ data }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `No se pudo guardar ${key}.`);
  }

  async function save(closeReview = true) {
    setPending("save");
    setMessage("");
    setError("");
    try {
      const allPeople = [
        ...partners,
        ...organization.lawyers,
        ...organization.interns,
        ...organization.administration,
      ];
      const ids = allPeople.map((person) => person.id.trim()).filter(Boolean);
      if (ids.length !== allPeople.length || new Set(ids).size !== ids.length) {
        throw new Error("Cada integrante debe tener un identificador único y no vacío.");
      }
      if (allPeople.some((person) => !person.name.trim())) {
        throw new Error("Cada integrante debe tener un nombre.");
      }
      const siteData = clone(siteDocument.data);
      const navData = clone(navigationDocument.data);
      const publicPartners = partners.map((partner) => ({
        id: partner.id,
        name: partner.name.trim(),
        chambers: partner.chambers.trim() || null,
        managing: partner.managing || undefined,
        visible: partner.visible,
        practiceAreaIds: partner.practiceAreaIds,
        email: partner.email.trim(),
        phoneDisplay: partner.phoneDisplay.trim(),
        phoneHref: partner.phoneHref.trim() || (partner.phoneDisplay ? `tel:${partner.phoneDisplay.replace(/[^\d+]/g, "")}` : ""),
        photo: partner.photo,
        cardPhoto: partner.cardPhoto.trim() || undefined,
        linkedin: partner.linkedin.trim() || undefined,
      }));
      siteData.partners = publicPartners;
      const serializeMember = (member: OrganizationMember) => ({
        ...member,
        name: member.name.trim(),
        roleEs: member.roleEs.trim(),
        roleEn: member.roleEn.trim(),
        specialtiesEs: extraSpecialties(member.specialtiesEs, practiceAreas),
        specialtiesEn: extraSpecialties(member.specialtiesEn, practiceAreas),
      });
      siteData.organization = {
        lawyers: organization.lawyers.map(serializeMember),
        interns: organization.interns.map(serializeMember),
        administration: organization.administration.map(serializeMember),
        partners: partners.map((partner) => ({
          id: partner.id,
          name: partner.name.trim(),
          photo: partner.cardPhoto || partner.photo || undefined,
          roleEs: partner.roleEs.trim(),
          roleEn: partner.roleEn.trim(),
          practiceAreaIds: partner.practiceAreaIds,
          specialtiesEs: extraSpecialties(partner.specialtiesEs, practiceAreas),
          specialtiesEn: extraSpecialties(partner.specialtiesEn, practiceAreas),
          visible: partner.visible,
        })),
      };

      const esData = record(navData.es);
      const enData = record(navData.en);
      navData.es = {
        ...esData,
        partners: Object.fromEntries(
          partners.map((partner) => [
            partner.id,
            {
              role: partner.roleEs.trim(),
              specialties: partner.specialtiesEs.map((item) => item.trim()).filter(Boolean),
              bio: partner.bioEs.trim(),
            },
          ]),
        ),
      };
      navData.en = {
        ...enData,
        partners: Object.fromEntries(
          partners.map((partner) => [
            partner.id,
            {
              role: partner.roleEn.trim(),
              specialties: partner.specialtiesEn.map((item) => item.trim()).filter(Boolean),
              bio: partner.bioEn.trim(),
            },
          ]),
        ),
      };

      await putDocument("site-config", siteData);
      await putDocument("navegacion-seo", navData);
      setSavedPartners(clone(partners));
      setSavedOrganization(clone(organization));
      setMessage("Cambios guardados. El sitio público todavía no se ha modificado.");
      if (closeReview) setReview(null);
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el equipo.");
      return false;
    } finally {
      setPending("");
    }
  }

  async function publish() {
    if (dirty && !(await save(false))) return;
    setPending("publish");
    setMessage("");
    setError("");
    try {
      for (const key of ["site-config", "navegacion-seo"]) {
        const response = await fetch(`/api/admin/documents/${key}/publish`, {
          method: "POST",
          headers: csrfHeaders(),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || `No se pudo publicar ${key}.`);
      }
      setPublishedPartners(clone(partners));
      setPublishedOrganization(clone(organization));
      setMessage("Cambios publicados correctamente.");
      setReview(null);
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "No se pudo publicar el equipo.");
    } finally {
      setPending("");
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${dirty ? "bg-amber-500" : "bg-emerald-500"}`} />
          <div>
            <p className="text-sm font-semibold text-slate-800">{dirty ? "Cambios sin guardar" : "Equipo cargado"}</p>
            <p className="text-xs text-slate-500">
              {partners.length} socio{partners.length === 1 ? "" : "s"} ·{" "}
              {organization.lawyers.length + organization.interns.length + organization.administration.length} integrantes adicionales
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-1.5 sm:items-end">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/content/equipo"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300"
            >
              Editar textos de la página <ArrowSquareOut size={15} />
            </Link>
            <button
              type="button"
              onClick={() => setReview("save")}
              disabled={!dirty || Boolean(pending)}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-sky-800 px-4 py-2 text-xs font-semibold text-sky-900 hover:bg-sky-50 disabled:border-slate-200 disabled:text-slate-400"
            >
              <FloppyDisk size={16} /> {pending === "save" ? "Guardando…" : "Guardar cambios"}
            </button>
            {canPublish && (
              <button
                type="button"
                onClick={() => setReview("publish")}
                disabled={Boolean(pending)}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0f4386] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0072ad] disabled:opacity-50"
              >
                <CloudArrowUp size={16} /> {pending === "publish" ? "Publicando…" : "Publicar cambios"}
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500">Guardar cambios no modifica el sitio público.</p>
        </div>
      </div>

      {message && (
        <p className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <Check size={18} weight="bold" /> {message}
        </p>
      )}
      {error && (
        <p className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <WarningCircle size={18} /> {error}
        </p>
      )}
      <ChangeReviewDialog
        open={Boolean(review)}
        title={review === "publish" ? "Publicar equipo y organigrama" : "Guardar cambios del equipo"}
        description={review === "publish" ? "Revisa personas, cargos, fotografías, orden y perfiles bilingües antes de hacerlos públicos." : "Comprueba todas las diferencias antes de guardar el borrador del equipo."}
        changes={reviewChanges}
        confirmLabel={review === "publish" ? "Publicar cambios" : "Guardar cambios"}
        pending={Boolean(pending)}
        tone={review === "publish" ? "publish" : "save"}
        onCancel={() => setReview(null)}
        onConfirm={review === "publish" ? publish : () => save()}
      />
      <ChangeReviewDialog
        open={Boolean(removeTarget)}
        eyebrow="Retirar persona"
        title={`Quitar a ${removeTarget?.name ?? ""}`}
        description="La persona se quitará del borrador actual. Podrás revisar nuevamente esta eliminación al guardar."
        changes={removeTarget ? buildChangeSet({ [removeTarget.id]: removeTarget }, {}) : []}
        confirmLabel="Quitar del borrador"
        tone="danger"
        onCancel={() => setRemoveTarget(null)}
        onConfirm={removePartner}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white xl:sticky xl:top-24">
          <div className="flex items-center justify-between border-b border-slate-200 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Perfiles públicos</p>
              <h2 className="mt-1 text-lg font-semibold">Socios</h2>
            </div>
            <button
              type="button"
              onClick={addPartner}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#0f4386] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0072ad]"
            >
              <Plus size={15} weight="bold" /> Añadir
            </button>
          </div>
          <div className="max-h-[64dvh] overflow-y-auto p-2">
            {partners.map((partner, index) => (
              <button
                key={partner.id}
                type="button"
                onClick={() => setSelectedId(partner.id)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                  selectedId === partner.id ? "bg-sky-50 text-sky-950" : "hover:bg-slate-50"
                }`}
              >
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {partner.photo ? (
                    <Image src={partner.photo} alt="" fill unoptimized className="object-cover object-top" />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-slate-400"><Users size={20} /></span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{partner.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">
                    {partner.roleEs || "Sin puesto"} · {partner.visible ? "Visible" : "Oculto"}
                  </span>
                </span>
                <span className="font-mono text-[0.65rem] text-slate-400">{String(index + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
          {!selected ? (
            <div className="grid min-h-96 place-items-center text-center">
              <div>
                <Users size={40} className="mx-auto text-slate-300" />
                <p className="mt-4 font-semibold text-slate-700">Añade el primer perfil del equipo</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Ficha individual</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">{selected.name}</h2>
                  <p className="mt-1 font-mono text-xs text-slate-400">/{selected.id}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => movePartner(-1)} aria-label="Subir en el orden" className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><ArrowUp size={17} /></button>
                  <button type="button" onClick={() => movePartner(1)} aria-label="Bajar en el orden" className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><ArrowDown size={17} /></button>
                  <button type="button" onClick={() => selected && setRemoveTarget(selected)} aria-label="Eliminar abogado" className="grid h-10 w-10 place-items-center rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50"><Trash size={17} /></button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  <PhotoField
                    value={selected.photo}
                    name={selected.name}
                    label="Foto de perfil"
                    help="Se usa en la ficha individual del socio."
                    onChange={(photo) => updatePartner({ photo })}
                  />
                  <PhotoField
                    value={selected.cardPhoto}
                    name={selected.name}
                    label="Foto para tarjetas"
                    help="Se usa en Portada y Equipo. Si se deja vacía, se mostrará la foto de perfil."
                    onChange={(cardPhoto) => updatePartner({ cardPhoto })}
                  />
                </div>

                <label className="block space-y-2 text-xs font-semibold text-slate-700">
                  Categoría dentro del organigrama
                  <select
                    value="partners"
                    onChange={(event) => {
                      const target = event.target.value as CategoryKey;
                      if (target !== "partners") movePartnerToGroup(selected, target);
                    }}
                    className={inputClass}
                  >
                    {(Object.keys(groupLabels) as CategoryKey[]).map((key) => (
                      <option key={key} value={key}>{groupLabels[key]}</option>
                    ))}
                  </select>
                  <span className="block font-normal text-slate-500">
                    Al cambiarla, la persona se moverá al grupo correspondiente sin perder sus datos.
                  </span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-xs font-semibold text-slate-700">
                    Nombre completo
                    <input
                      value={selected.name}
                      onChange={(event) => updatePartner({ name: event.target.value })}
                      onBlur={() => {
                        if (selected.id.startsWith("nuevo-")) {
                          const nextId = uniqueId(selected.name, partners.filter((partner) => partner.id !== selected.id).map((partner) => partner.id));
                          setPartners((current) => current.map((partner) => partner.id === selected.id ? { ...partner, id: nextId } : partner));
                          setSelectedId(nextId);
                        }
                      }}
                      className={inputClass}
                    />
                  </label>
                  <label className="space-y-2 text-xs font-semibold text-slate-700">
                    Identificador URL
                    <input value={selected.id} onChange={(event) => {
                      const nextId = slugify(event.target.value);
                      setPartners((current) => current.map((partner) => partner.id === selected.id ? { ...partner, id: nextId } : partner));
                      setSelectedId(nextId);
                    }} className={inputClass} />
                  </label>
                  <label className="space-y-2 text-xs font-semibold text-slate-700">
                    Puesto en español
                    <input value={selected.roleEs} onChange={(event) => updatePartner({ roleEs: event.target.value })} className={inputClass} />
                  </label>
                  <label className="space-y-2 text-xs font-semibold text-slate-700">
                    Puesto en inglés
                    <input value={selected.roleEn} onChange={(event) => updatePartner({ roleEn: event.target.value })} className={inputClass} />
                  </label>
                </div>

                <PracticeAreaSelector
                  options={practiceAreas}
                  selectedIds={selected.practiceAreaIds}
                  onChange={updatePartnerPracticeAreas}
                />

                <div className="grid gap-4 lg:grid-cols-2">
                  <StringList
                    label="Especialidades adicionales — Español"
                    values={extraSpecialties(selected.specialtiesEs, practiceAreas)}
                    onChange={(extras) => updatePartner({
                      specialtiesEs: mergePracticeAreas(selected.practiceAreaIds, extras, practiceAreas, "es"),
                    })}
                  />
                  <StringList
                    label="Additional specialties — English"
                    values={extraSpecialties(selected.specialtiesEn, practiceAreas)}
                    onChange={(extras) => updatePartner({
                      specialtiesEn: mergePracticeAreas(selected.practiceAreaIds, extras, practiceAreas, "en"),
                    })}
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="space-y-2 text-xs font-semibold text-slate-700">
                    Biografía — Español
                    <textarea rows={8} value={selected.bioEs} onChange={(event) => updatePartner({ bioEs: event.target.value })} className={inputClass} />
                  </label>
                  <label className="space-y-2 text-xs font-semibold text-slate-700">
                    Biography — English
                    <textarea rows={8} value={selected.bioEn} onChange={(event) => updatePartner({ bioEn: event.target.value })} className={inputClass} />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-xs font-semibold text-slate-700">Correo<input type="email" value={selected.email} onChange={(event) => updatePartner({ email: event.target.value })} className={inputClass} /></label>
                  <label className="space-y-2 text-xs font-semibold text-slate-700">Teléfono visible<input value={selected.phoneDisplay} onChange={(event) => updatePartner({ phoneDisplay: event.target.value })} className={inputClass} /></label>
                  <label className="space-y-2 text-xs font-semibold text-slate-700">Enlace telefónico<input value={selected.phoneHref} onChange={(event) => updatePartner({ phoneHref: event.target.value })} placeholder="tel:+5281…" className={inputClass} /></label>
                  <label className="space-y-2 text-xs font-semibold text-slate-700">LinkedIn<input value={selected.linkedin} onChange={(event) => updatePartner({ linkedin: event.target.value })} className={inputClass} /></label>
                  <label className="space-y-2 text-xs font-semibold text-slate-700">Reconocimiento Chambers<input value={selected.chambers} onChange={(event) => updatePartner({ chambers: event.target.value })} placeholder="Band 2, Up and Coming…" className={inputClass} /></label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                    <span><span className="block text-sm font-semibold">Visible en el sitio</span><span className="text-xs text-slate-500">Ocultar conserva el perfil en el borrador.</span></span>
                    <input type="checkbox" checked={selected.visible} onChange={(event) => updatePartner({ visible: event.target.checked })} className="h-5 w-5 accent-sky-700" />
                  </label>
                  <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                    <span><span className="block text-sm font-semibold">Socio Director</span><span className="text-xs text-slate-500">Activa el distintivo principal.</span></span>
                    <input type="checkbox" checked={selected.managing} onChange={(event) => updatePartner({ managing: event.target.checked })} className="h-5 w-5 accent-sky-700" />
                  </label>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Organigrama</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Equipo adicional</h2>
            <p className="mt-1 text-sm text-slate-500">Asociados, pasantes y administración pueden llevar fotografía, LinkedIn o mostrarse con iniciales.</p>
          </div>
          <div className="flex rounded-xl bg-slate-100 p-1">
            {additionalGroupKeys.map((key) => (
              <button key={key} type="button" onClick={() => setGroup(key)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${group === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                {groupLabels[key]} ({organization[key].length})
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {organization[group].map((member, index) => (
            <article key={`${member.id}-${index}`} className="rounded-2xl border border-slate-200 p-4 md:p-5">
              <div className="grid gap-4 md:grid-cols-[72px_1fr_auto] md:items-start">
                <CompactPhotoField
                  value={member.photo ?? ""}
                  name={member.name}
                  onChange={(photo) => updateMember(group, index, { photo: photo || undefined })}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-xs font-semibold text-slate-700">
                    Nombre
                    <input
                      value={member.name}
                      onChange={(event) => updateMember(group, index, { name: event.target.value })}
                      className={inputClass}
                    />
                  </label>
                  <label className="space-y-2 text-xs font-semibold text-slate-700">
                    Categoría
                    <select
                      value={group}
                      onChange={(event) =>
                        moveMemberCategory(group, index, event.target.value as CategoryKey)
                      }
                      className={inputClass}
                    >
                      {(Object.keys(groupLabels) as CategoryKey[]).map((key) => (
                        <option key={key} value={key}>{groupLabels[key]}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-xs font-semibold text-slate-700">
                    Identificador
                    <input
                      value={member.id}
                      onChange={(event) => updateMember(group, index, { id: slugify(event.target.value) })}
                      className={inputClass}
                    />
                  </label>
                  <label className="space-y-2 text-xs font-semibold text-slate-700">
                    Puesto en español
                    <input
                      value={member.roleEs}
                      onChange={(event) => updateMember(group, index, { roleEs: event.target.value })}
                      className={inputClass}
                    />
                  </label>
                  <label className="space-y-2 text-xs font-semibold text-slate-700 sm:col-start-2">
                    Puesto en inglés
                    <input
                      value={member.roleEn}
                      onChange={(event) => updateMember(group, index, { roleEn: event.target.value })}
                      className={inputClass}
                    />
                  </label>
                  <label className="space-y-2 text-xs font-semibold text-slate-700 sm:col-span-2">
                    LinkedIn verificado
                    <input
                      type="url"
                      value={member.linkedin ?? ""}
                      onChange={(event) => updateMember(group, index, { linkedin: event.target.value || undefined })}
                      placeholder="https://www.linkedin.com/in/…"
                      className={inputClass}
                    />
                    <span className="block font-normal text-slate-500">Si está vacío, la tarjeta no será un enlace.</span>
                  </label>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => moveMember(group, index, -1)} aria-label="Subir" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200"><ArrowUp size={15} /></button>
                  <button type="button" onClick={() => moveMember(group, index, 1)} aria-label="Bajar" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200"><ArrowDown size={15} /></button>
                  <button type="button" onClick={() => setOrganization((current) => ({ ...current, [group]: current[group].filter((_, memberIndex) => memberIndex !== index) }))} aria-label="Eliminar" className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 text-rose-700"><Trash size={15} /></button>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-200 pt-5">
                <PracticeAreaSelector
                  options={practiceAreas}
                  selectedIds={member.practiceAreaIds}
                  onChange={(ids) => updateMemberPracticeAreas(group, index, ids)}
                />
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <StringList
                    label="Especialidades adicionales — Español"
                    values={extraSpecialties(member.specialtiesEs, practiceAreas)}
                    onChange={(extras) => updateMember(group, index, {
                      specialtiesEs: mergePracticeAreas(member.practiceAreaIds, extras, practiceAreas, "es"),
                    })}
                  />
                  <StringList
                    label="Additional specialties — English"
                    values={extraSpecialties(member.specialtiesEn, practiceAreas)}
                    onChange={(extras) => updateMember(group, index, {
                      specialtiesEn: mergePracticeAreas(member.practiceAreaIds, extras, practiceAreas, "en"),
                    })}
                  />
                </div>
                <label className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                  <span>
                    <span className="block text-sm font-semibold">Visible en el sitio</span>
                    <span className="text-xs text-slate-500">Ocultar conserva a la persona en el borrador.</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={member.visible}
                    onChange={(event) => updateMember(group, index, { visible: event.target.checked })}
                    className="h-5 w-5 accent-sky-700"
                  />
                </label>
              </div>
            </article>
          ))}
          <button type="button" onClick={() => addMember(group)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-sm font-semibold text-slate-600 hover:border-sky-600 hover:text-sky-800">
            <Plus size={17} weight="bold" /> Añadir a {groupLabels[group]}
          </button>
        </div>
      </section>
    </>
  );
}
