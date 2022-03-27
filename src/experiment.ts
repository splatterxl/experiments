// thanks advaith

import { ActionRow, ActionRowBuilder, Interaction, InteractionReplyOptions, MessageActionRowComponent, SelectMenuBuilder, SelectMenuOptionBuilder } from "discord.js";
import { lastFetchedAt, rollouts } from ".";

const andList = new Intl.ListFormat();
const orList = new Intl.ListFormat({ style: "unit", type: "disjunction" });


export interface Experiment { 
	data: {
		id: string
		type: 'guild'
		title: string
		description: string[]
		buckets: number[]
		hash: number
	}
	rollout: [
		number, // hash
		null,
		number,
		[ // populations
			[
				number, //bucket
				{ // rollout
					/** start */ s: number,
					/** end */   e: number
				}[]
			][],
			Filter[]
		][],
		{ // overrides
			/** bucket */     b: number,
			/** server IDs */ k: string[]
		}[]
	]
}

export enum FilterType {
	Feature = 1604612045,
	IDRange = 2404720969,
	MemberCount = 2918402255,
	ID = 3013771838,
	HubType = 4148745523
}

type FeatureFilter = [FilterType.Feature, [[number, string[]]]];
type IDRangeFilter = [FilterType.IDRange, [[number, number | null], [number, number]]];
type MemberCountFilter = [FilterType.MemberCount, [[number, number | null], [number, number]]];
type IDFilter = [FilterType.ID, [[number, string[]]]];
type HubTypeFilter = [FilterType.HubType, [[number, number[]]]];

export type Filter = FeatureFilter | IDRangeFilter | MemberCountFilter | IDFilter | HubTypeFilter;

const parseFilter = (f: Filter) => {
	if (f[0] === FilterType.Feature) return `Server has feature ${orList.format(f[1][0][1])}`;
	if (f[0] === FilterType.IDRange) return `Server ID is in range ${f[1][0][1] ?? 0} - ${f[1][1][1]}`;
	if (f[0] === FilterType.MemberCount) return `Server member count is ${f[1][1][1] ? `in range ${f[1][0][1] ?? 0} - ${f[1][1][1]}` : `${f[1][0][1]}+`}`;
	if (f[0] === FilterType.ID) return `Server ID is ${orList.format(f[1][0][1])}`;
	if (f[0] === FilterType.HubType) return `Server hub type is ${orList.format(f[1][0][1].map(t => t.toString()))}`;
	return `Unknown filter type ${f[0]}`;
};

export function renderExperimentHomeView(i: Interaction, id: string): InteractionReplyOptions {
  const exp = rollouts.get(id)!;

  return {
    embeds: [{
      title: `${exp.data.title} (${exp.data.id})`,
      description: exp.data.description.join("\n"),
      color: 0xffcc00,
      footer: {
        text: `${exp.data.id} - ${exp.data.buckets.length} buckets`
      }
    }],
    components: renderPageSelect(i, exp)
  };
}

export function renderRolloutView(i: Interaction, id: string): InteractionReplyOptions {
  const exp = rollouts.get(id)!;

  return {
    embeds: [{
      title: `${exp.data.title} (${exp.data.id})`,
      description: `Rollout data available may not always be accurate. Last updated: <t:${Math.floor(lastFetchedAt / 1000)}>`,
      color: 0xffcc00,
      footer: {
        text: `${exp.data.id} - ${exp.data.buckets.length} buckets`
      }
    }],
    components: renderPageSelect(i, exp)
  };
}

export function renderPageSelect(i: Interaction, exp: Experiment): ActionRow<MessageActionRowComponent>[] {
  return [
      new ActionRowBuilder()
        .addComponents(
          new SelectMenuBuilder()
          .setCustomId(`page,view,${i.user.id}`)
          .addOptions(
            new SelectMenuOptionBuilder()
              .setLabel("Home")
              .setValue(`home,${exp.data.id}`)
              .setDescription("View this experiment's details.")
              .toJSON(),
            new SelectMenuOptionBuilder()
              .setLabel("Rollout")
              .setValue(`rollout,${exp.data.id}`)
              .setDescription("View the rollout of this experiment.")
             .toJSON(),
          ) 
        )
        .toJSON(),
  ] as unknown as any
}
