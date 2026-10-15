/** FlipRadar proposed seller-funded success fee model.
 * Platform fee is 1% of the contributor's gross reward, never 1% of the sale price.
 * This module is a quote only: it does not confirm a sale, collect money, or create a payable balance.
 */
export function calculateReward(grossRewardUah:number){
 if(!Number.isSafeInteger(grossRewardUah)||grossRewardUah<0||grossRewardUah>100000000)return null;
 const platformFeeKop=Math.round(grossRewardUah*100/100);
 const contributorKop=grossRewardUah*100-platformFeeKop;
 return {grossRewardUah,platformFeeUah:platformFeeKop/100,contributorUah:contributorKop/100};
}
