import { ComponentMeta, ComponentStory } from '@storybook/react'
import { useState } from 'react'

import { useDaoInfoContext } from '@dao-dao/common'

import {
  DaoInfoBar,
  DaoInfoBarProps,
  ProposalsTabProps,
  SubDaosTabProps,
  TreasuryAndNftsTabProps,
} from 'components'
import {
  ProfileHomeCard,
  ProfileHomeCardProps,
} from 'components/profile/ProfileHomeCard'
import { DaoPageWrapperDecorator, makeAppLayoutDecorator } from 'decorators'
import { DaoHome } from 'pages/DaoHome'
import { Default as DaoInfoBarStory } from 'stories/components/dao/DaoInfoBar.stories'
import { Default as ProposalsTabStory } from 'stories/components/dao/tabs/ProposalsTab.stories'
import { Default as SubDaosTabStory } from 'stories/components/dao/tabs/SubDaosTab.stories'
import { Default as TreasuryAndNftsTabStory } from 'stories/components/dao/tabs/TreasuryAndNftsTab.stories'
import { Default as ProfileHomeCardStory } from 'stories/components/profile/ProfileHomeCard.stories'

export default {
  title: 'DAO DAO UI V2 / pages / DaoHome',
  component: DaoHome,
  decorators: [
    // Direct ancestor of rendered story.
    DaoPageWrapperDecorator,
    makeAppLayoutDecorator({
      rightSidebar: (
        <ProfileHomeCard
          {...(ProfileHomeCardStory.args as ProfileHomeCardProps)}
        />
      ),
    }),
  ],
} as ComponentMeta<typeof DaoHome>

const Template: ComponentStory<typeof DaoHome> = (args) => {
  const [pinned, setPinned] = useState(false)

  return (
    <DaoHome
      {...args}
      daoInfo={useDaoInfoContext()}
      onPin={() => setPinned((p) => !p)}
      pinned={pinned}
    />
  )
}

export const Default = Template.bind({})
Default.args = {
  daoInfoBar: <DaoInfoBar {...(DaoInfoBarStory.args as DaoInfoBarProps)} />,
  proposalsTab: (
    <ProposalsTabStory {...(ProposalsTabStory.args as ProposalsTabProps)} />
  ),
  treasuryAndNftsTab: (
    <TreasuryAndNftsTabStory
      {...(TreasuryAndNftsTabStory.args as TreasuryAndNftsTabProps)}
    />
  ),
  subDaosTab: (
    <SubDaosTabStory {...(SubDaosTabStory.args as SubDaosTabProps)} />
  ),
}
Default.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/ZnQ4SMv8UUgKDZsR5YjVGH/DAO-DAO-2.0?node-id=317%3A28615',
  },
}
