import {
  Col,
  Input,
  Link,
  Radio,
  Row,
  Spacer,
  Switch,
  Text,
  Textarea,
} from "@nextui-org/react";
import { OnboardingFlow } from "@prisma/client";
import { CustomSelect, SelectOption } from "components/CustomSelect";
import { Divider } from "components/Divider";
import { TipFormData } from "components/tipper/TipForm/TipFormData";
import { getNativeLanguageName } from "lib/i18n/iso6391";
import { locales } from "lib/i18n/locales";
import { getRecommendedItems } from "lib/items/getRecommendedItems";
import { wallets } from "lib/items/wallets";
import { getRedeemUrl } from "lib/utils";
import React from "react";
import {
  Control,
  Controller,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { toast } from "react-hot-toast";

const tippeeLocaleSelectOptions: SelectOption[] = locales.map((locale) => ({
  value: locale,
  label: getNativeLanguageName(locale),
}));

type TipFormAdvancedOptionsProps = {
  mode: "create" | "update";
  register: UseFormRegister<TipFormData>;
  control: Control<TipFormData, unknown>;
  setValue: UseFormSetValue<TipFormData>;
  watch: UseFormWatch<TipFormData>;
  quantity: number;
  satsAmount: number;
};

export function TipFormAdvancedOptions({
  mode,
  register,
  control,
  watch,
  setValue,
  quantity,
  satsAmount,
}: TipFormAdvancedOptionsProps) {
  const watchedTippeeLocale = watch("tippeeLocale");
  const watchedRecommendedWalletId = watch("recommendedWalletId");
  const watchedTippeeName = watch("tippeeName");
  const watchedOnboardingFlow = watch("onboardingFlow");
  const watchedEnterIndividualNames = watch("enterIndividualNames");
  // const watchedGeneratePassphrase = watch("generatePassphrase");

  const recommendedWalletSelectOptions: SelectOption[] = React.useMemo(
    () =>
      getRecommendedItems("wallets", undefined, undefined, {
        checkTippeeBalance: true,
        filterOtherItems: true,
        lnurlAuthCapable: watchedOnboardingFlow === "LIGHTNING",
        tippeeBalance: satsAmount,
        sortAlphabetically: true,
      }).map((wallet) => ({
        value: wallet.id,
        label: wallet.name,
      })),
    [satsAmount, watchedOnboardingFlow]
  );

  const setOnboardingFlow = React.useCallback(
    (onboardingFlow: OnboardingFlow) => {
      setValue("onboardingFlow", onboardingFlow);
    },
    [setValue]
  );

  const setTippeeLocale = React.useCallback(
    (locale: string) => {
      setValue("tippeeLocale", locale);
    },
    [setValue]
  );

  const setRecommendedWalletId = React.useCallback(
    (recommendedWalletId: string | undefined) => {
      setValue("recommendedWalletId", recommendedWalletId);
    },
    [setValue]
  );

  React.useEffect(() => {
    if (
      watchedRecommendedWalletId &&
      watchedOnboardingFlow === "LIGHTNING" &&
      (
        wallets.find((wallet) => wallet.id === watchedRecommendedWalletId)
          ?.features ?? []
      ).indexOf("lnurl-auth") < 0
    ) {
      setRecommendedWalletId(undefined);
      toast.error("Removed recommended wallet (lnurl-auth not supported)");
    }
  }, [
    watchedRecommendedWalletId,
    watchedOnboardingFlow,
    setRecommendedWalletId,
  ]);

  return (
    <>
      {mode === "create" && <Spacer />}
      <Row align="flex-start">
        <Col>
          <Text>⌛ Tip expiry</Text>
          <Text small css={{ mt: 6, lineHeight: 1.2, display: "inline-block" }}>
            Days until the tip returns back to you.
          </Text>
        </Col>
        <Col css={{ ta: "right" }}>
          <Controller
            name="expiresIn"
            control={control}
            render={({ field }) => (
              <Input
                aria-label="Tip expires in"
                {...field}
                {...register("expiresIn", {
                  valueAsNumber: true,
                })}
                min={1}
                style={{
                  textAlign: "center",
                }}
                width="100px"
                type="number"
                inputMode="decimal"
                bordered
                color="primary"
              />
            )}
          />
        </Col>
      </Row>
      <Divider />
      <Radio.Group
        label="Onboarding Flow"
        defaultValue="1"
        value={watchedOnboardingFlow}
        size="sm"
        onChange={(e) => setOnboardingFlow(e as OnboardingFlow)}
      >
        {Object.values(OnboardingFlow).map((value) => (
          <Radio
            key={value}
            value={value}
            description={
              <Text small>{getOnboardingFlowDescription(value)}</Text>
            }
          >
            {value === "DEFAULT"
              ? "🦔 Standard"
              : value === "SKIP"
              ? "⏭️ Skip"
              : "⚡ Lightning"}
          </Radio>
        ))}
      </Radio.Group>

      <Divider />
      <Controller
        name="tippeeName"
        control={control}
        render={({ field }) =>
          quantity > 1 ? (
            <Col>
              <Row align="center" justify="space-between">
                <Row>
                  <Text>Recipient names</Text>
                </Row>
                <Row align="flex-start" justify="flex-end">
                  <Text size="small">Individual Names</Text>
                  <Spacer x={0.5} />
                  <Switch
                    size="xs"
                    checked={watchedEnterIndividualNames}
                    onChange={(e) =>
                      setValue("enterIndividualNames", e.target.checked)
                    }
                  />
                </Row>
              </Row>
              <Spacer y={0.5} />
              {watchedEnterIndividualNames && (
                <Text size="small">
                  Entered{" "}
                  {watchedTippeeName?.split("\n").filter((name) => name)
                    .length || 0}
                  &nbsp;/&nbsp;{quantity} names
                </Text>
              )}
              <Textarea
                {...field}
                aria-label={"Recipient names"}
                placeholder={
                  watchedEnterIndividualNames
                    ? `Hal Finney
Micheal Saylor`
                    : "Recipient {{index}}"
                }
                fullWidth
                bordered
                rows={watchedEnterIndividualNames ? quantity : undefined}
              />
            </Col>
          ) : (
            <Input
              {...field}
              label="Recipient name"
              placeholder="Hal Finney"
              maxLength={255}
              fullWidth
              bordered
            />
          )
        }
      />
      <Spacer />
      <Controller
        name="note"
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            label={quantity > 1 ? "Note to recipients" : "Note to recipient"}
            placeholder={
              quantity > 1
                ? "Thank you {{name}} for your amazing service!"
                : "Thank you for your amazing service!"
            }
            maxLength={1000}
            fullWidth
            bordered
          />
        )}
      />
      <Spacer />
      <Text>Recipient Language</Text>
      <Text size="small">
        {
          "Your recipient's language is autodetected, but you can explictly set it if needed."
        }
      </Text>
      <Spacer y={0.5} />
      <CustomSelect
        options={tippeeLocaleSelectOptions}
        isClearable
        value={watchedTippeeLocale}
        onChange={setTippeeLocale}
        width="100px"
      />
      <Spacer />
      <Text>Recommended Wallet ID</Text>
      <Text size="small">
        {"The recipient will always be recommended this wallet."}
      </Text>
      <Spacer y={0.5} />
      <CustomSelect
        key={
          watchedRecommendedWalletId /* for some reason cannot clear programatically without this */
        }
        options={recommendedWalletSelectOptions}
        isClearable
        value={watchedRecommendedWalletId}
        onChange={setRecommendedWalletId}
        width="100px"
      />
      {recommendedWalletSelectOptions.length < wallets.length && (
        <Col>
          <Text size="x-small">
            {wallets.length - recommendedWalletSelectOptions.length} wallets
            hidden:
          </Text>
          {wallets
            .filter(
              (wallet) =>
                !recommendedWalletSelectOptions.some(
                  (recommendedWallet) => recommendedWallet.value === wallet.id
                )
            )
            .map((wallet) => (
              <Text key={wallet.id} size="x-small">
                {wallet.name} (
                {[
                  ...(wallet.minBalance
                    ? [`${wallet.minBalance} min sats`]
                    : []),
                  ...(wallet.features.indexOf("lnurl-auth") < 0
                    ? [`lnurl-auth not supported`]
                    : []),
                ].join(", ")}
                )
              </Text>
            ))}
        </Col>
      )}
      <Divider />
      <Row align="flex-start">
        <Col>
          <Text css={{ whiteSpace: "nowrap" }}>👤 Anonymous Tipper</Text>
        </Col>
        <Col css={{ ta: "right" }}>
          <Controller
            name="anonymousTipper"
            control={control}
            render={({ field }) => (
              <Switch
                {...field}
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />
        </Col>
      </Row>
      <Text
        small
        css={{
          mt: 0,
          mb: 6,
          lineHeight: 1.2,
          display: "inline-block",
        }}
      >
        Hide your info from your recipient
      </Text>
      <Divider />
      <Row align="flex-start">
        <Col>
          <Text css={{ whiteSpace: "nowrap" }}>🆒 Generate Passphrase</Text>
        </Col>
        <Col css={{ ta: "right" }}>
          <Controller
            name="generatePassphrase"
            control={control}
            render={({ field }) => (
              <Switch
                {...field}
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />
        </Col>
      </Row>
      {/*watchedGeneratePassphrase && (
        <>
          <Row justify="space-between" align="center">
            <Text>Passphrase Length</Text>
            <Controller
              name="passphraseLength"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  {...register("passphraseLength", {
                    valueAsNumber: true,
                  })}
                  aria-label="Passphrase Length"
                  min={MIN_TIP_PASSPHRASE_LENGTH}
                  max={MAX_TIP_PASSPHRASE_LENGTH}
                  type="number"
                  inputMode="numeric"
                  bordered
                  width="100px"
                />
              )}
            />
          </Row>
          <Spacer y={0.5} />
        </>
                )*/}
      <Text
        small
        css={{
          mt: 0,
          mb: 6,
          lineHeight: 1.2,
          display: "inline-block",
        }}
      >
        Generate a passphrase your recipient can enter at{" "}
        <Link href={getRedeemUrl()} target="_blank" css={{ display: "inline" }}>
          {getRedeemUrl()}
        </Link>
        . You can use this option for printed tips for recipients who cannot
        scan a QR code.
      </Text>
    </>
  );
}

function getOnboardingFlowDescription(flow: OnboardingFlow): string {
  switch (flow) {
    case "DEFAULT":
      return "Recipient will claim with any login method, and then will go through a short onboarding before being able to withdraw their tip.";
    case "SKIP":
      return "Allow your recipient to directly withdraw without logging in.";
    case "LIGHTNING":
      return "Suggest a lnurl-auth compatible Lightning wallet, then only allow claiming with Lightning.";
  }
}
