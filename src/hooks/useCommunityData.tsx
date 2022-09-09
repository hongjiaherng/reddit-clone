import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState } from "recoil";
import {
	Community,
	CommunitySnippet,
	communityState,
} from "../atoms/communitiesAtom";
import { auth, firestore } from "../firebase/clientApp";

const useCommunityData = () => {
	const [user] = useAuthState(auth);
	const [communityStateValue, setCommunityStateValue] =
		useRecoilState(communityState);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const onJoinOrLeaveCommunity = (
		communityData: Community,
		isJoined: boolean
	) => {
		// is the user signed in?
		// if not => open auth modal
		// if yes
		if (isJoined) {
			leaveCommunity(communityData.id);
			return;
		}
		joinCommunity(communityData);
	};

	const getMySnippets = async () => {
		setLoading(true);
		try {
			// get user snippets
			const snippetDocs = await getDocs(
				collection(firestore, `users/${user?.uid}/communitySnippets`)
			);

			const snippets = snippetDocs.docs.map((doc) => ({ ...doc.data() }));
			setCommunityStateValue((prev) => ({
				...prev,
				mySnippets: snippets as CommunitySnippet[],
			}));

			console.log("Here are snippets", snippets);
		} catch (error) {
			console.log("getMySnippets error", error);
		}
        setLoading(false);
	};

	const joinCommunity = (communityData: Community) => {
        // batch write
        // - creating a new community snippet
        // - updating the numberOfMembers (+1)

        // update recoil state - communityState.mySnippets
    };

	const leaveCommunity = (communityId: string) => {
        // batch write
        // - delteing the community snippet from user
        // - updating the numberOfMembers (-1)

        // update recoil state - communityState.mySnippets
    };

	useEffect(() => {
		if (!user) return;
		getMySnippets();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	return {
		// data and functions
		communityStateValue,
		onJoinOrLeaveCommunity,
        loading,
	};
};
export default useCommunityData;
