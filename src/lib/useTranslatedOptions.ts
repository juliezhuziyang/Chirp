import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CONTRIBUTE_EMOTION_IDS,
  NEED_OPTION_IDS,
  PARROT_SPECIES,
} from "./constants";

export function useNeedOptions() {
  const { t } = useTranslation();

  return useMemo(
    () =>
      NEED_OPTION_IDS.map((id) => ({
        id,
        label: t(`needs.${id}`),
      })),
    [t],
  );
}

export function useParrotSpecies() {
  const { t } = useTranslation();

  return useMemo(
    () =>
      PARROT_SPECIES.map((species) => ({
        id: species,
        label: t(`species.${species}`),
      })),
    [t],
  );
}

export function useContributeEmotions() {
  const { t } = useTranslation();

  return useMemo(
    () =>
      CONTRIBUTE_EMOTION_IDS.map((emotion) => ({
        id: emotion,
        label: t(`emotions.${emotion}`),
      })),
    [t],
  );
}
