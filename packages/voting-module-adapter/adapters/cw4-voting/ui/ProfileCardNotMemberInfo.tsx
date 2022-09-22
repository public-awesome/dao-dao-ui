import { BaseProfileCardNotMemberInfoProps } from '@dao-dao/tstypes'
import { useTranslation } from 'react-i18next'

export interface ProfileCardNotMemberInfoProps extends BaseProfileCardNotMemberInfoProps {
  daoName: string
}

export const ProfileCardNotMemberInfo = ({
  daoName,
  proposalContext,
}: ProfileCardNotMemberInfoProps) => {
  const { t } = useTranslation()

  return (
    <p className="secondary-text">
      {t('info.membershipDaoNotMemberInfo', { daoName, context: proposalContext ? 'proposal' : 'dao' })}
    </p>
  )
}
