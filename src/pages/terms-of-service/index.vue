<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <view class="min-h-screen bg-gray-50">
    <view class="px-4 py-6">
      <!-- 协议标题 -->
      <view class="bg-white rounded-xl p-6 mb-4 shadow-sm">
        <text class="text-xl font-bold text-gray-800 text-center block ">
          江理一起来学小程序
        </text>
        <text class="text-xl font-bold text-gray-800 text-center block mb-2">
          用户协议与法律协议
        </text>
        <text class="text-sm text-gray-600 text-center block">
          请您在使用本小程序前仔细阅读本协议全部条款
        </text>
      </view>

      <!-- 协议内容 -->
      <view class="bg-white rounded-xl p-6 shadow-sm">
        <view class="space-y-6">
          <!-- 协议前言 -->
          <view class="text-sm text-gray-700 leading-relaxed">
            本协议由您与本小程序管理者（以下简称我们{{ quot }}或{{ quot }}本小程序{{ quot }}）签订，对双方具有法律约束力。请您在使用本小程序前仔细阅读本协议全部条款，尤其是免除或者限制责任、法律适用与争议解决条款。除非您已充分阅读并接受本协议所有条款并完成注册/授权程序，您无权或不应使用本小程序所提供的全部或部分服务。您使用微信一键登录小程序或以其他方式表示同意的，即表示您已完全接受本协议全部条款，并自愿受其约束。
          </view>

          <!-- 一、生效与修改 -->
          <view class="space-y-3">
            <text class="text-lg font-semibold text-gray-800 block">一、生效与修改</text>
            <view class="pl-3 space-y-2">
              <text class="text-sm text-gray-700 block leading-relaxed">
                1. 本协议内容包括协议正文及本小程序已经发布或将来发布的各类规则、说明、操作指引等，构成本协议不可分割的组成部分，具有同等法律效力。
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                2. 我们有权根据需要不定期制定、修改本协议或各类规则，并在本小程序内公示，公示后即生效；无需对单个用户逐一通知。若您不同意修改后的协议，应立即停止使用本小程序；您继续使用本小程序即视为接受修改后的协议。
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                3. 本协议与其更新版本适用于本小程序的当前及将来所有版本（包括但不限于功能更新、界面调整等）。
              </text>
            </view>
          </view>

          <!-- 二、使用许可与限制性条款 -->
          <view class="space-y-3">
            <text class="text-lg font-semibold text-gray-800 block">二、使用许可与限制性条款</text>
            <view class="pl-3 space-y-2">
              <text class="text-sm text-gray-700 block leading-relaxed">
                1. 本小程序授予您个人、非排他、不可转让、不可再授权的有限使用权，仅可用于您个人通过本小程序查询信息及本小程序提供的其他服务（以下统称{{ quot }}服务{{ quot }}）。
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                2. 您在使用本小程序时应遵守下列限制：
              </text>
              <view class="pl-3 space-y-1">
                <text class="text-sm text-gray-700 block leading-relaxed">
                  (1) 不得将本小程序内的任何数据、内容或功能用于商业用途（包括但不限于许可、出售、出租、转让、发行等）；
                </text>
                <text class="text-sm text-gray-700 block leading-relaxed">
                  (2) 未经我们书面许可，不得对本小程序的任何部分或其衍生产品进行修改、翻译、改编、合并、反向工程、反向编译、反向汇编或以其他方式破解本小程序；
                </text>
                <text class="text-sm text-gray-700 block leading-relaxed">
                  (3) 不得以任何形式复制、生产、展示、传播、发布或制作本小程序内容的衍生作品，除非经我们授权；
                </text>
                <text class="text-sm text-gray-700 block leading-relaxed">
                  (4) 除本小程序提供的分享功能（如分享链接、导出课程表等）外，您不得以程序外任何方式下载、抓取、传播或盗取本小程序内的数据和内容；
                </text>
                <text class="text-sm text-gray-700 block leading-relaxed">
                  (5) 如您停止使用本服务或本服务终止，我们可在服务器上永久删除您的数据，本小程序不承担向您返还数据的义务（除法律另有强制规定或双方另有约定外）。
                </text>
              </view>
              <text class="text-sm text-gray-700 block leading-relaxed">
                3. 您确认并同意，本小程序有权在合理范围内限制、暂停或终止向您提供服务，包括但不限于发现您违反本条款或存在安全风险时。
              </text>
            </view>
          </view>

          <!-- 三、禁止性行为 -->
          <view class="space-y-3">
            <text class="text-lg font-semibold text-gray-800 block">三、禁止性行为（您已同意不从事下列行为）</text>
            <view class="pl-3 space-y-2">
              <text class="text-sm text-gray-700 block leading-relaxed">
                1. 发布、传输或分享包含电脑病毒、蠕虫、木马或其他任何恶意代码的内容，或故意破坏、篡改计算机系统或数据；
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                2. 未经授权收集、使用、公开其他用户或第三方的个人信息（例如微信号、联系方式、学号等）；
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                3. 使用任何自动化工具（机器人、爬虫、脚本等）或以其他非正常方式批量、频繁、恶意访问本小程序或对服务器施加过度负载，或以其他方式干扰本小程序的正常运行；
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                4. 未经授权尝试访问、篡改、拷贝或提取本小程序的服务器数据、通信数据或其他受保护的信息；
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                5. 干扰、阻碍、破坏其他用户正常使用本小程序的行为；以任何方式规避、绕过本小程序设置的访问限制及安全保护措施；
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                6. 利用本小程序发布、传播法律法规禁止的内容或从事任何非法活动。
              </text>
            </view>
          </view>

          <!-- 四、内容规范与服务使用规则 -->
          <view class="space-y-3">
            <text class="text-lg font-semibold text-gray-800 block">四、内容规范与服务使用规则</text>
            <view class="pl-3 space-y-2">
              <text class="text-sm text-gray-700 block leading-relaxed">
                1. 本条所指内容包括但不限于用户在本小程序提交的信息、用户在服务使用过程中上传的文字、语音、图片、视频、链接等一切行为产生的内容（统称{{ quot }}用户内容{{ quot }}）。
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                2. 您不得利用本小程序制作、上传、发布、传播以下法律法规禁止的内容：
              </text>
              <view class="pl-3 space-y-1">
                <text class="text-sm text-gray-700 block leading-relaxed">
                  (1) 反对宪法所确定的基本原则的；
                </text>
                <text class="text-sm text-gray-700 block leading-relaxed">
                  (2) 危害国家安全、泄露国家秘密、颠覆国家政权、破坏国家统一的；
                </text>
                <text class="text-sm text-gray-700 block leading-relaxed">
                  (3) 损害国家荣誉和利益的；
                </text>
                <text class="text-sm text-gray-700 block leading-relaxed">
                  (4) 煽动民族仇恨、民族歧视、破坏民族团结的；
                </text>
                <text class="text-sm text-gray-700 block leading-relaxed">
                  (5) 破坏国家宗教政策，宣扬邪教、封建迷信的；
                </text>
                <text class="text-sm text-gray-700 block leading-relaxed">
                  (6) 散布谣言、扰乱社会秩序、破坏社会稳定的；
                </text>
                <text class="text-sm text-gray-700 block leading-relaxed">
                  (7) 散布淫秽、色情、赌博、暴力、恐怖或教唆犯罪的；
                </text>
                <text class="text-sm text-gray-700 block leading-relaxed">
                  (8) 侮辱、诽谤他人，侵害他人合法权益的；
                </text>
                <text class="text-sm text-gray-700 block leading-relaxed">
                  (9) 违反其他法律法规或本小程序规定的内容。
                </text>
              </view>
              <text class="text-sm text-gray-700 block leading-relaxed">
                3. 您不得利用本小程序发布、传播干扰平台正常运营或侵害他人合法权益的内容，如含性暗示、辱骂、恐吓、骚扰、垃圾广告、诱骗、侵犯隐私或知识产权等。
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                4. 与课程表相关的特别规则：
              </text>
              <view class="pl-3 space-y-1">
                <text class="text-sm text-gray-700 block leading-relaxed">
                  (1) 本小程序允许您通过内置功能查看课程表，您应仅在获得相关课程、教师或第三方许可的情况下分享含有他人信息的课程表内容；
                </text>
                <text class="text-sm text-gray-700 block leading-relaxed">
                  (2) 未经授权不得通过爬虫、抓包等技术手段批量导出或传播他人课程信息；
                </text>
              </view>
            </view>
          </view>

          <!-- 五、知识产权 -->
          <view class="space-y-3">
            <text class="text-lg font-semibold text-gray-800 block">五、知识产权</text>
            <view class="pl-3 space-y-2">
              <text class="text-sm text-gray-700 block leading-relaxed">
                1. 除本小程序中涉及广告等由第三方享有的知识产权外，本小程序中由我们开发的程序代码、界面设计、功能模块、数据库结构、图文音视频素材及其它相关内容（以下统称{{ quot }}本小程序内容{{ quot }}）的著作权、专利权及其他知识产权均归本小程序管理者或相关权利人所有。
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                2. 对于您在使用本小程序过程中产生的用户内容，您同意授予本小程序一项全球范围内的、非独占、免许可费、可转授权的许可，用于本小程序的展示、传播、推广、存储、备份及改进服务的用途。若您不希望授予该许可，应停止使用并删除相关用户内容；但已基于该用户内容形成的系统记录或已发布的内容可能无法撤回。
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                3. 未经我们书面许可，您不得以任何方式展示、使用本小程序的标识、名称或其他受保护的标识，不得宣称您对本小程序的任何权利或获得任何特殊授权。
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                4. 任何对本小程序内容或第三方权利人的知识产权的侵犯行为，我们保留追究其法律责任的权利。
              </text>
            </view>
          </view>

          <!-- 六、法律责任与赔偿 -->
          <view class="space-y-3">
            <text class="text-lg font-semibold text-gray-800 block">六、法律责任与赔偿</text>
            <view class="pl-3 space-y-2">
              <text class="text-sm text-gray-700 block leading-relaxed">
                1. 如我们有合理理由认为您发布、传播的内容或您的行为违反法律法规或本协议规定，我们有权采取包括但不限于删除内容、限制功能、暂停或终止账号、屏蔽相关信息、向有关主管机关报告及追究法律责任等措施。
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                2. 因您违反本协议或法律法规而导致本小程序或任何第三方遭受损失（包括合理的调查费、律师费、执行费等），您应当承担全部赔偿责任，并使本小程序及相关方免受损害。
              </text>
            </view>
          </view>

          <!-- 七、免责声明 -->
          <view class="space-y-3">
            <text class="text-lg font-semibold text-gray-800 block">七、免责声明</text>
            <view class="pl-3 space-y-2">
              <text class="text-sm text-gray-700 block leading-relaxed">
                1. 您理解并同意，本小程序服务可能因设备故障、网络原因、第三方服务中断、黑客攻击、计算机病毒、不可抗力或其他非本小程序可控因素导致无法使用或出现损失，针对上述情形本小程序在法律允许范围内不承担责任。
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                2. 本小程序不对用户通过平台发布的信息的真实性、完整性承担保证责任；对于因用户之间的互动或交易产生的任何纠纷、损失或责任，除因本小程序故意或重大过失外，本小程序不承担赔偿责任。
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                3. 对于因您使用本小程序提供的功能导致的信息泄露或其他损失，若非本小程序过错，您应自行承担风险。
              </text>
            </view>
          </view>

          <!-- 八、隐私与数据 -->
          <view class="space-y-3">
            <text class="text-lg font-semibold text-gray-800 block">八、隐私与数据</text>
            <view class="pl-3 space-y-2">
              <text class="text-sm text-gray-700 block leading-relaxed">
                1. 本小程序在提供服务过程中会收集必要的信息（如您在注册或使用服务时提供的个人信息、设备与日志信息等），我们将严格按照国家法律法规及本小程序公布的隐私政策处理您的个人信息。
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                2. 我们仅为提供、维护、改进服务之目的使用您的数据；经您同意的，亦可用于学情分析、产品优化及必要的运营服务。未经您许可，不会向无关第三方披露您的个人信息，但法律法规另有规定或司法、行政机关有合法要求的除外。
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                3. 您有权根据法律规定查询、更正或删除您的个人信息，具体操作请参考本小程序内的隐私政策或联系客服。
              </text>
            </view>
          </view>

          <!-- 九、争议解决与适用法律 -->
          <view class="space-y-3">
            <text class="text-lg font-semibold text-gray-800 block">九、争议解决与适用法律</text>
            <view class="pl-3 space-y-2">
              <text class="text-sm text-gray-700 block leading-relaxed">
                1. 本协议的效力、解释及争议解决适用于中华人民共和国法律，如发生争议双方应首先友好协商解决；协商不成的，任一方可向本小程序管理者住所地有管辖权的人民法院提起诉讼。
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                2. 本协议任何条款如被具有管辖权的人民法院认定为无效或不可执行，不影响本协议其他条款的效力，本协议其他条款仍应全面有效。
              </text>
            </view>
          </view>

          <!-- 十、其他 -->
          <view class="space-y-3">
            <text class="text-lg font-semibold text-gray-800 block">十、其他</text>
            <view class="pl-3 space-y-2">
              <text class="text-sm text-gray-700 block leading-relaxed">
                1. 本协议构成双方就本协议事项的完整协议，除双方另有书面约定外，任何与本协议相抵触的口头或书面承诺均无效。
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                2. 若您为未成年人，您应在法定监护人的同意或指导下使用本小程序及相关服务，因未成年人使用本服务而产生的任何后果，应由其监护人承担相应责任。
              </text>
              <text class="text-sm text-gray-700 block leading-relaxed">
                3. 若您对本协议或本小程序的服务有任何疑问，请通过本小程序内的联系方式与我们取得联系。
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部提示 -->
      <view class="text-center py-6">
        <text class="text-xs text-gray-500">
          本协议最后更新时间：2025-10-09
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
const quot = '"'
</script>

<style scoped>
.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.space-y-1 > * + * {
  margin-top: 0.25rem;
}

.leading-relaxed {
  line-height: 1.625;
}
</style>
