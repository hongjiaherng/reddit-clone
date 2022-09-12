import { doc, getDoc } from "firebase/firestore";
import { GetServerSidePropsContext } from "next";
import React, { useEffect } from "react";
import { Community, communityState } from "../../../atoms/communitiesAtom";
import { firestore } from "../../../firebase/clientApp";
import safeJsonStringify from "safe-json-stringify";
import NotFound from "../../../components/Community/NotFound";
import Header from "../../../components/Community/Header";
import PageContent from "../../../components/Layout/PageContent";
import CreatePostLink from "../../../components/Community/CreatePostLink";
import Posts from "../../../components/Posts/Posts";
import { useSetRecoilState } from "recoil";
import About from "../../../components/Community/About";

type CommunityPageProps = {
	communityData: Community;
};

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
	const setCommunityStateValue = useSetRecoilState(communityState);

	if (!communityData) {
		return <NotFound />;
	}

	// eslint-disable-next-line react-hooks/rules-of-hooks
	useEffect(() => {
		setCommunityStateValue((prev) => ({
			...prev,
			currentCommunity: communityData
		}))
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [communityData]);

	return (
		<>
			<Header communityData={communityData} />
			<PageContent>
				{/* Child 1 */}
				<>
					<CreatePostLink />
					<Posts communityData={communityData} />
				</>

				{/* Child 2 */}
				<>
					<About communityData={communityData} />
				</>
			</PageContent>
		</>
	);
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
	// get community data and pass it to client
	try {
		const communityDocRef = doc(
			firestore,
			"communities",
			context.query.communityId as string
		);
		const communityDoc = await getDoc(communityDocRef);

		return {
			props: {
				communityData: communityDoc.exists()
					? JSON.parse(
							safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() })
					  )
					: "",
			},
		};
	} catch (error) {
		// Could add error page here
		console.log("getServerSideProps error", error);
	}
}

export default CommunityPage;
