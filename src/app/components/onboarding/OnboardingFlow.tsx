import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Bird, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { NEED_OPTIONS, PARROT_SPECIES } from "../../../lib/constants";
import { formatAgeLabel } from "../../../lib/localAuth";
import type { BirdSex, OnboardingData } from "../../../lib/types";
import { OnboardingProgress } from "./OnboardingProgress";
import { OptionCard } from "./OptionCard";
import { Slider } from "../ui/slider";

type StepId =
  | "owns-parrot"
  | "species"
  | "bird-name"
  | "sex"
  | "age"
  | "needs";

export function OnboardingFlow() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [speciesSearch, setSpeciesSearch] = useState("");

  const [ownsParrot, setOwnsParrot] = useState<boolean | null>(null);
  const [birdName, setBirdName] = useState("");
  const [species, setSpecies] = useState("");
  const [sex, setSex] = useState<BirdSex | null>(null);
  const [ageMonths, setAgeMonths] = useState(12);
  const [needs, setNeeds] = useState<string[]>([]);

  const steps: StepId[] = useMemo(() => {
    if (ownsParrot === false) return ["owns-parrot", "needs"];
    if (ownsParrot === true) {
      return ["owns-parrot", "species", "bird-name", "sex", "age", "needs"];
    }
    return ["owns-parrot"];
  }, [ownsParrot]);

  const currentStep = steps[stepIndex];
  const totalSteps = steps.length;

  const filteredSpecies = PARROT_SPECIES.filter((s) =>
    s.toLowerCase().includes(speciesSearch.toLowerCase()),
  );

  const toggleNeed = (id: string) => {
    setNeeds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id],
    );
  };

  const canContinue = () => {
    switch (currentStep) {
      case "owns-parrot":
        return ownsParrot !== null;
      case "species":
        return species.length > 0;
      case "bird-name":
        return birdName.trim().length > 0;
      case "sex":
        return sex !== null;
      case "age":
        return ageMonths >= 1;
      case "needs":
        return needs.length > 0;
      default:
        return false;
    }
  };

  const goNext = async () => {
    if (stepIndex < totalSteps - 1) {
      setStepIndex((i) => i + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      const data: OnboardingData = {
        ownsParrot: ownsParrot ?? false,
        needs,
      };
      if (ownsParrot) {
        data.birdName = birdName.trim();
        data.species = species;
        data.sex = sex ?? undefined;
        data.ageMonths = ageMonths;
      }
      await completeOnboarding(data);
      navigate("/dashboard/sound", { replace: true });
    } catch {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const slideVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <OnboardingProgress current={stepIndex + 1} total={totalSteps} />

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 max-w-xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full"
          >
            {currentStep === "owns-parrot" && (
              <QuestionBlock title="Do you own a parrot?">
                <OptionCard
                  label="Yes"
                  selected={ownsParrot === true}
                  onClick={() => setOwnsParrot(true)}
                  icon={<Bird className="w-6 h-6 text-orange-500" />}
                />
                <OptionCard
                  label="No"
                  selected={ownsParrot === false}
                  onClick={() => setOwnsParrot(false)}
                />
              </QuestionBlock>
            )}

            {currentStep === "species" && (
              <QuestionBlock title="What species is your parrot?">
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search species..."
                    value={speciesSearch}
                    onChange={(e) => setSpeciesSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-orange-100 bg-white focus:border-orange-400 focus:outline-none"
                  />
                </div>
                <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
                  {filteredSpecies.map((s) => (
                    <OptionCard
                      key={s}
                      label={s}
                      selected={species === s}
                      onClick={() => setSpecies(s)}
                    />
                  ))}
                </div>
              </QuestionBlock>
            )}

            {currentStep === "bird-name" && (
              <QuestionBlock title="What is your bird's name?">
                <input
                  type="text"
                  value={birdName}
                  onChange={(e) => setBirdName(e.target.value)}
                  placeholder="e.g. Kiwi, Mango, Sunny..."
                  className="w-full px-5 py-4 rounded-2xl border-2 border-orange-100 bg-white text-lg focus:border-orange-400 focus:outline-none text-center font-medium"
                  autoFocus
                />
              </QuestionBlock>
            )}

            {currentStep === "sex" && (
              <QuestionBlock title="What is your bird's sex?">
                <OptionCard label="Male" selected={sex === "male"} onClick={() => setSex("male")} />
                <OptionCard label="Female" selected={sex === "female"} onClick={() => setSex("female")} />
                <OptionCard label="Not sure" selected={sex === "unsure"} onClick={() => setSex("unsure")} />
              </QuestionBlock>
            )}

            {currentStep === "age" && (
              <QuestionBlock title="How old is your bird?">
                <div className="bg-white rounded-3xl p-8 border-2 border-orange-100 shadow-lg">
                  <p className="text-4xl font-bold text-center bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-8">
                    {formatAgeLabel(ageMonths)}
                  </p>
                  <Slider
                    min={1}
                    max={120}
                    step={1}
                    value={[ageMonths]}
                    onValueChange={([v]) => setAgeMonths(v)}
                    className="[&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-orange-500 [&_[data-slot=slider-range]]:to-amber-500"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-4 font-medium">
                    <span>1 month</span>
                    <span>10 years</span>
                  </div>
                </div>
              </QuestionBlock>
            )}

            {currentStep === "needs" && (
              <QuestionBlock title="What do you need the most?" subtitle="Select all that apply">
                {NEED_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.id}
                    label={opt.label}
                    selected={needs.includes(opt.id)}
                    onClick={() => toggleNeed(opt.id)}
                    multi
                  />
                ))}
              </QuestionBlock>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-4 w-full mt-8 max-w-xl">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-orange-200 bg-white font-semibold text-gray-700 hover:bg-orange-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}
          <button
            type="button"
            disabled={!canContinue() || isSubmitting}
            onClick={goNext}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : stepIndex === totalSteps - 1 ? (
              "Get Started"
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-gray-500 mt-2">{subtitle}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
