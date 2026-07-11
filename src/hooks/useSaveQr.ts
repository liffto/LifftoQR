import { useMemo } from 'react'
import { recordToWebsiteCreatePayload, recordToWebsiteUpdatePayload } from '../api/qrcode/website.mappers'
import { recordToTextCreatePayload, recordToTextUpdatePayload } from '../api/qrcode/text.mappers'
import { recordToWifiCreatePayload, recordToWifiUpdatePayload } from '../api/qrcode/wifi.mappers'
import { recordToVcardCreatePayload, recordToVcardUpdatePayload } from '../api/qrcode/vcard.mappers'
import { recordToEmailCreatePayload, recordToEmailUpdatePayload } from '../api/qrcode/email.mappers'
import { recordToSmsCreatePayload, recordToSmsUpdatePayload } from '../api/qrcode/sms.mappers'
import { recordToPhoneCreatePayload, recordToPhoneUpdatePayload } from '../api/qrcode/phone.mappers'
import { recordToWhatsappCreatePayload, recordToWhatsappUpdatePayload } from '../api/qrcode/whatsapp.mappers'
import { recordToEventCreatePayload, recordToEventUpdatePayload } from '../api/qrcode/event.mappers'
import { recordToLocationCreatePayload, recordToLocationUpdatePayload } from '../api/qrcode/location.mappers'
import { recordToSocialMediaCreatePayload, recordToSocialMediaUpdatePayload } from '../api/qrcode/socialMedia.mappers'
import { recordToGoogleReviewCreatePayload, recordToGoogleReviewUpdatePayload } from '../api/qrcode/googleReview.mappers'
import { recordToPdfCreatePayload, recordToPdfUpdatePayload } from '../api/qrcode/pdf.mappers'
import { recordToVideoCreatePayload, recordToVideoUpdatePayload } from '../api/qrcode/video.mappers'
import { recordToAudioCreatePayload, recordToAudioUpdatePayload } from '../api/qrcode/audio.mappers'
import { recordToAppCreatePayload, recordToAppUpdatePayload } from '../api/qrcode/app.mappers'
import { recordToLinkTreeCreatePayload, recordToLinkTreeUpdatePayload } from '../api/qrcode/linkTree.mappers'
import { recordToCouponCreatePayload, recordToCouponUpdatePayload } from '../api/qrcode/coupon.mappers'
import { recordToInvitationCreatePayload, recordToInvitationUpdatePayload } from '../api/qrcode/invitation.mappers'
import { recordToFeedbackCreatePayload, recordToFeedbackUpdatePayload } from '../api/qrcode/feedback.mappers'
import { useCreateWebsite, useUpdateWebsite } from './useWebsite'
import { useCreateText, useUpdateText } from './useText'
import { useCreateWifi, useUpdateWifi } from './useWifi'
import { useCreateVcard, useUpdateVcard } from './useVcard'
import { useCreateEmail, useUpdateEmail } from './useEmail'
import { useCreateSms, useUpdateSms } from './useSms'
import { useCreatePhone, useUpdatePhone } from './usePhone'
import { useCreateWhatsapp, useUpdateWhatsapp } from './useWhatsapp'
import { useCreateEvent, useUpdateEvent } from './useEvent'
import { useCreateLocation, useUpdateLocation } from './useLocation'
import { useCreateSocialMedia, useUpdateSocialMedia } from './useSocialMedia'
import { useCreateGoogleReview, useUpdateGoogleReview } from './useGoogleReview'
import { useCreatePdf, useUpdatePdf } from './usePdf'
import { useCreateVideo, useUpdateVideo } from './useVideo'
import { useCreateAudio, useUpdateAudio } from './useAudio'
import { useCreateApp, useUpdateApp } from './useApp'
import { useCreateLinkTree, useUpdateLinkTree } from './useLinkTree'
import { useCreateCoupon, useUpdateCoupon } from './useCoupon'
import { useCreateInvitation, useUpdateInvitation } from './useInvitation'
import { useCreateFeedback, useUpdateFeedback } from './useFeedback'

type QrRecord = {
  typeKey: string
  [key: string]: unknown
}

export function useSaveQr() {
  const createWebsite = useCreateWebsite()
  const updateWebsite = useUpdateWebsite()
  const createText = useCreateText()
  const updateText = useUpdateText()
  const createWifi = useCreateWifi()
  const updateWifi = useUpdateWifi()
  const createVcard = useCreateVcard()
  const updateVcard = useUpdateVcard()
  const createEmail = useCreateEmail()
  const updateEmail = useUpdateEmail()
  const createSms = useCreateSms()
  const updateSms = useUpdateSms()
  const createPhone = useCreatePhone()
  const updatePhone = useUpdatePhone()
  const createWhatsapp = useCreateWhatsapp()
  const updateWhatsapp = useUpdateWhatsapp()
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const createLocation = useCreateLocation()
  const updateLocation = useUpdateLocation()
  const createSocialMedia = useCreateSocialMedia()
  const updateSocialMedia = useUpdateSocialMedia()
  const createGoogleReview = useCreateGoogleReview()
  const updateGoogleReview = useUpdateGoogleReview()
  const createPdf = useCreatePdf()
  const updatePdf = useUpdatePdf()
  const createVideo = useCreateVideo()
  const updateVideo = useUpdateVideo()
  const createAudio = useCreateAudio()
  const updateAudio = useUpdateAudio()
  const createApp = useCreateApp()
  const updateApp = useUpdateApp()
  const createLinkTree = useCreateLinkTree()
  const updateLinkTree = useUpdateLinkTree()
  const createCoupon = useCreateCoupon()
  const updateCoupon = useUpdateCoupon()
  const createInvitation = useCreateInvitation()
  const updateInvitation = useUpdateInvitation()
  const createFeedback = useCreateFeedback()
  const updateFeedback = useUpdateFeedback()

  const isSaving = [
    createWebsite,
    updateWebsite,
    createText,
    updateText,
    createWifi,
    updateWifi,
    createVcard,
    updateVcard,
    createEmail,
    updateEmail,
    createSms,
    updateSms,
    createPhone,
    updatePhone,
    createWhatsapp,
    updateWhatsapp,
    createEvent,
    updateEvent,
    createLocation,
    updateLocation,
    createSocialMedia,
    updateSocialMedia,
    createGoogleReview,
    updateGoogleReview,
    createPdf,
    updatePdf,
    createVideo,
    updateVideo,
    createAudio,
    updateAudio,
    createApp,
    updateApp,
    createLinkTree,
    updateLinkTree,
    createCoupon,
    updateCoupon,
    createInvitation,
    updateInvitation,
    createFeedback,
    updateFeedback,
  ].some((mutation) => mutation.isPending)

  const saveQr = useMemo(
    () =>
      async (record: QrRecord, options: { qrId?: number | null; isUpdate?: boolean } = {}) => {
        const { typeKey } = record
        const isUpdate = Boolean(options.isUpdate && options.qrId)
        const qrId = options.qrId as number

        switch (typeKey) {
          case 'url':
            if (isUpdate) {
              await updateWebsite.mutateAsync({
                websiteId: qrId,
                payload: recordToWebsiteUpdatePayload(record as never),
              })
            } else {
              await createWebsite.mutateAsync(recordToWebsiteCreatePayload(record as never))
            }
            return
          case 'text':
            if (isUpdate) {
              await updateText.mutateAsync({
                textId: qrId,
                payload: recordToTextUpdatePayload(record as never),
              })
            } else {
              await createText.mutateAsync(recordToTextCreatePayload(record as never))
            }
            return
          case 'wifi':
            if (isUpdate) {
              await updateWifi.mutateAsync({
                wifiId: qrId,
                payload: recordToWifiUpdatePayload(record as never),
              })
            } else {
              await createWifi.mutateAsync(recordToWifiCreatePayload(record as never))
            }
            return
          case 'vcard':
            if (isUpdate) {
              await updateVcard.mutateAsync({
                vcardId: qrId,
                payload: recordToVcardUpdatePayload(record as never),
              })
            } else {
              await createVcard.mutateAsync(recordToVcardCreatePayload(record as never))
            }
            return
          case 'email':
            if (isUpdate) {
              await updateEmail.mutateAsync({
                emailId: qrId,
                payload: recordToEmailUpdatePayload(record as never),
              })
            } else {
              await createEmail.mutateAsync(recordToEmailCreatePayload(record as never))
            }
            return
          case 'sms':
            if (isUpdate) {
              await updateSms.mutateAsync({
                smsId: qrId,
                payload: recordToSmsUpdatePayload(record as never),
              })
            } else {
              await createSms.mutateAsync(recordToSmsCreatePayload(record as never))
            }
            return
          case 'phone':
            if (isUpdate) {
              await updatePhone.mutateAsync({
                phoneId: qrId,
                payload: recordToPhoneUpdatePayload(record as never),
              })
            } else {
              await createPhone.mutateAsync(recordToPhoneCreatePayload(record as never))
            }
            return
          case 'whatsapp':
            if (isUpdate) {
              await updateWhatsapp.mutateAsync({
                whatsappId: qrId,
                payload: recordToWhatsappUpdatePayload(record as never),
              })
            } else {
              await createWhatsapp.mutateAsync(recordToWhatsappCreatePayload(record as never))
            }
            return
          case 'event':
            if (isUpdate) {
              await updateEvent.mutateAsync({
                eventId: qrId,
                payload: recordToEventUpdatePayload(record as never),
              })
            } else {
              await createEvent.mutateAsync(recordToEventCreatePayload(record as never))
            }
            return
          case 'location':
            if (isUpdate) {
              await updateLocation.mutateAsync({
                locationId: qrId,
                payload: recordToLocationUpdatePayload(record as never),
              })
            } else {
              await createLocation.mutateAsync(recordToLocationCreatePayload(record as never))
            }
            return
          case 'social':
            if (isUpdate) {
              await updateSocialMedia.mutateAsync({
                socialMediaId: qrId,
                payload: recordToSocialMediaUpdatePayload(record as never),
              })
            } else {
              await createSocialMedia.mutateAsync(
                recordToSocialMediaCreatePayload(record as never),
              )
            }
            return
          case 'google-review':
            if (isUpdate) {
              await updateGoogleReview.mutateAsync({
                googleReviewId: qrId,
                payload: recordToGoogleReviewUpdatePayload(record as never),
              })
            } else {
              await createGoogleReview.mutateAsync(
                recordToGoogleReviewCreatePayload(record as never),
              )
            }
            return
          case 'pdf':
            if (isUpdate) {
              await updatePdf.mutateAsync({
                pdfId: qrId,
                payload: recordToPdfUpdatePayload(record as never),
              })
            } else {
              await createPdf.mutateAsync(recordToPdfCreatePayload(record as never))
            }
            return
          case 'video':
            if (isUpdate) {
              await updateVideo.mutateAsync({
                videoId: qrId,
                payload: recordToVideoUpdatePayload(record as never),
              })
            } else {
              await createVideo.mutateAsync(recordToVideoCreatePayload(record as never))
            }
            return
          case 'mp3':
            if (isUpdate) {
              await updateAudio.mutateAsync({
                audioId: qrId,
                payload: recordToAudioUpdatePayload(record as never),
              })
            } else {
              await createAudio.mutateAsync(recordToAudioCreatePayload(record as never))
            }
            return
          case 'app':
            if (isUpdate) {
              await updateApp.mutateAsync({
                appId: qrId,
                payload: recordToAppUpdatePayload(record as never),
              })
            } else {
              await createApp.mutateAsync(recordToAppCreatePayload(record as never))
            }
            return
          case 'linktree':
            if (isUpdate) {
              await updateLinkTree.mutateAsync({
                linkTreeId: qrId,
                payload: recordToLinkTreeUpdatePayload(record as never),
              })
            } else {
              await createLinkTree.mutateAsync(recordToLinkTreeCreatePayload(record as never))
            }
            return
          case 'coupon':
            if (isUpdate) {
              await updateCoupon.mutateAsync({
                couponId: qrId,
                payload: recordToCouponUpdatePayload(record as never),
              })
            } else {
              await createCoupon.mutateAsync(recordToCouponCreatePayload(record as never))
            }
            return
          case 'invitation':
            if (isUpdate) {
              await updateInvitation.mutateAsync({
                invitationId: qrId,
                payload: recordToInvitationUpdatePayload(record as never),
              })
            } else {
              await createInvitation.mutateAsync(
                recordToInvitationCreatePayload(record as never),
              )
            }
            return
          case 'feedback':
            if (isUpdate) {
              await updateFeedback.mutateAsync({
                feedbackId: qrId,
                payload: recordToFeedbackUpdatePayload(record as never),
              })
            } else {
              await createFeedback.mutateAsync(recordToFeedbackCreatePayload(record as never))
            }
            return
          default:
            throw new Error(`Unsupported QR type: ${typeKey}`)
        }
      },
    [
      createWebsite,
      updateWebsite,
      createText,
      updateText,
      createWifi,
      updateWifi,
      createVcard,
      updateVcard,
      createEmail,
      updateEmail,
      createSms,
      updateSms,
      createPhone,
      updatePhone,
      createWhatsapp,
      updateWhatsapp,
      createEvent,
      updateEvent,
      createLocation,
      updateLocation,
      createSocialMedia,
      updateSocialMedia,
      createGoogleReview,
      updateGoogleReview,
      createPdf,
      updatePdf,
      createVideo,
      updateVideo,
      createAudio,
      updateAudio,
      createApp,
      updateApp,
      createLinkTree,
      updateLinkTree,
      createCoupon,
      updateCoupon,
      createInvitation,
      updateInvitation,
      createFeedback,
      updateFeedback,
    ],
  )

  return { saveQr, isSaving }
}
