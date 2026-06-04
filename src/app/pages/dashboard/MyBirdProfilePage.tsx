import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Bird, Pencil, Save, X, Upload, Camera } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { NEED_OPTIONS, PARROT_SPECIES } from "../../../lib/constants";
import { formatAgeLabel } from "../../../lib/localAuth";
import { BIRD_AVATAR_PRESETS } from "../../../lib/avatars";
import type { BirdSex, UserAvatar as UserAvatarData } from "../../../lib/types";
import { Slider } from "../../components/ui/slider";
import { UserAvatar } from "../../components/shared/UserAvatar";

export default function MyBirdProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [birdName, setBirdName] = useState("");
  const [species, setSpecies] = useState("");
  const [sex, setSex] = useState<BirdSex | null>(null);
  const [ageMonths, setAgeMonths] = useState(12);
  const [needs, setNeeds] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<UserAvatarData | null>(null);
  const [speciesSearch, setSpeciesSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    if (!user) return;
    setBirdName(user.bird?.name ?? "");
    setSpecies(user.bird?.species ?? "");
    setSex(user.bird?.sex ?? null);
    setAgeMonths(user.bird?.ageMonths ?? 12);
    setNeeds([...(user.needs ?? [])]);
    setAvatar(user.avatar);
  };

  useEffect(() => {
    resetForm();
  }, [user]);

  const filteredSpecies = PARROT_SPECIES.filter((s) =>
    s.toLowerCase().includes(speciesSearch.toLowerCase()),
  );

  const toggleNeed = (id: string) => {
    setNeeds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id],
    );
  };

  const handleAvatarFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar({
        type: "custom",
        presetId: null,
        customUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await updateProfile({
        ownsParrot: user?.ownsParrot ?? true,
        bird: user?.ownsParrot
          ? {
              name: birdName.trim() || null,
              species: species || null,
              sex,
              ageMonths,
            }
          : user?.bird,
        needs,
        avatar: avatar ?? undefined,
      });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setEditing(false);
    setError("");
  };

  if (!user) return null;

  const displayAvatar = avatar ?? user.avatar;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bird className="w-8 h-8 text-orange-500" />
            My Bird Profile
          </h1>
          <p className="text-gray-500 mt-1">Your bird&apos;s information and preferences</p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-orange-200 bg-white hover:bg-orange-50 text-orange-700 font-medium transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      <motion.div
        layout
        className="bg-white/95 backdrop-blur rounded-3xl border border-orange-100 shadow-lg overflow-hidden"
      >
        <div className="p-6 sm:p-8 border-b border-orange-50 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <UserAvatar avatar={displayAvatar} size="xl" />
            {editing && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg hover:bg-orange-600"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleAvatarFile(f);
              }}
            />
          </div>
          <div className="text-center sm:text-left flex-1">
            {editing ? (
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {BIRD_AVATAR_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setAvatar({ type: "preset", presetId: p.id, customUrl: null })
                    }
                    className={`w-10 h-10 rounded-full text-lg bg-gradient-to-br ${p.gradient} ${
                      displayAvatar.presetId === p.id && displayAvatar.type === "preset"
                        ? "ring-2 ring-orange-500 ring-offset-2"
                        : ""
                    }`}
                  >
                    {p.emoji}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-3 py-1 text-sm rounded-lg border border-orange-200 text-orange-700 flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" /> Upload
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Bird avatar</p>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {user.ownsParrot ? (
            <>
              <Field label="Bird Name" editing={editing}>
                {editing ? (
                  <input
                    value={birdName}
                    onChange={(e) => setBirdName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 focus:border-orange-400 outline-none"
                    placeholder="e.g. Kiwi"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">
                    {user.bird?.name || "—"}
                  </p>
                )}
              </Field>

              <Field label="Species" editing={editing}>
                {editing ? (
                  <>
                    <input
                      value={speciesSearch}
                      onChange={(e) => setSpeciesSearch(e.target.value)}
                      placeholder="Search..."
                      className="w-full px-4 py-2 rounded-xl border border-orange-100 mb-2"
                    />
                    <select
                      value={species}
                      onChange={(e) => setSpecies(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-orange-100"
                    >
                      <option value="">Select species</option>
                      {filteredSpecies.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <p className="text-gray-800">{user.bird?.species || "—"}</p>
                )}
              </Field>

              <Field label="Sex" editing={editing}>
                {editing ? (
                  <div className="flex flex-wrap gap-2">
                    {(["male", "female", "unsure"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSex(s)}
                        className={`px-4 py-2 rounded-xl border-2 font-medium ${
                          sex === s
                            ? "border-orange-500 bg-orange-50 text-orange-800"
                            : "border-orange-100"
                        }`}
                      >
                        {s === "unsure" ? "Not sure" : s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-800 capitalize">
                    {user.bird?.sex === "unsure" ? "Not sure" : user.bird?.sex || "—"}
                  </p>
                )}
              </Field>

              <Field label="Age" editing={editing}>
                {editing ? (
                  <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100">
                    <p className="text-center font-bold text-orange-700 mb-3">
                      {formatAgeLabel(ageMonths)}
                    </p>
                    <Slider
                      min={1}
                      max={120}
                      step={1}
                      value={[ageMonths]}
                      onValueChange={([v]) => setAgeMonths(v)}
                    />
                  </div>
                ) : (
                  <p className="text-gray-800">
                    {user.bird?.ageMonths != null
                      ? formatAgeLabel(user.bird.ageMonths)
                      : "—"}
                  </p>
                )}
              </Field>
            </>
          ) : (
            <p className="text-gray-600">You indicated you don&apos;t own a parrot yet.</p>
          )}

          <Field label="Your needs & preferences" editing={editing}>
            {editing ? (
              <div className="flex flex-wrap gap-2">
                {NEED_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleNeed(opt.id)}
                    className={`px-3 py-2 rounded-xl text-sm border-2 ${
                      needs.includes(opt.id)
                        ? "border-orange-500 bg-orange-50 text-orange-800"
                        : "border-orange-100 text-gray-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.needs.length === 0 ? (
                  <span className="text-gray-500">—</span>
                ) : (
                  user.needs.map((id) => (
                    <span
                      key={id}
                      className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full"
                    >
                      {NEED_OPTIONS.find((n) => n.id === id)?.label ?? id}
                    </span>
                  ))
                )}
              </div>
            )}
          </Field>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-xl">{error}</p>
          )}

          {editing && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-orange-200 font-semibold text-gray-700 hover:bg-orange-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  editing,
  children,
}: {
  label: string;
  editing: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {label}
      </h3>
      {children}
    </div>
  );
}
