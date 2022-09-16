import {
	collection,
	doc,
	getDoc,
	getDocs,
	increment,
	writeBatch,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authModalState } from "../atoms/authModalAtom";
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
	const setAuthModalState = useSetRecoilState(authModalState);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const onJoinOrLeaveCommunity = (
		communityData: Community,
		isJoined: boolean
	) => {
		// is the user signed in?
		// if yes
		if (!user) {
			// if not => open auth modal
			setAuthModalState({ open: true, view: "login" });
			return;
		}

		setLoading(true);
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
				snippetsFetched: true,
			}));

			console.log("Here are snippets", snippets);
		} catch (error: any) {
			console.log("getMySnippets error", error);
			setError(error.message);
		}
		setLoading(false);
	};

	const joinCommunity = async (communityData: Community) => {
		// batch write
		try {
			const batch = writeBatch(firestore);

			// - creating a new community snippet
			const newSnippet: CommunitySnippet = {
				communityId: communityData.id,
				imageURL: communityData.imageURL || "",
				isModerator: user?.uid === communityData.creatorId,
			};

			batch.set(
				doc(
					firestore,
					`users/${user?.uid}/communitySnippets`,
					communityData.id
				),
				newSnippet
			);

			// - updating the numberOfMembers (+1)
			batch.update(doc(firestore, "communities", communityData.id), {
				numberOfMembers: increment(1),
			});

			// execute batch write
			await batch.commit();

			// update recoil state - communityState.mySnippets
			setCommunityStateValue((prev) => ({
				...prev,
				mySnippets: [...prev.mySnippets, newSnippet],
			}));
		} catch (error: any) {
			console.log("joinCommunity error", error);
			setError(error.message);
		}
		setLoading(false);
	};

	const leaveCommunity = async (communityId: string) => {
		// batch write
		try {
			const batch = writeBatch(firestore);

			// - deleting the community snippet from user
			batch.delete(
				doc(firestore, `users/${user?.uid}/communitySnippets`, communityId)
			);

			// - updating the numberOfMembers (-1)
			batch.update(doc(firestore, "communities", communityId), {
				numberOfMembers: increment(-1),
			});

			await batch.commit();

			// update recoil state - communityState.mySnippets
			setCommunityStateValue((prev) => ({
				...prev,
				mySnippets: prev.mySnippets.filter(
					(item) => item.communityId !== communityId
				),
			}));
		} catch (error: any) {
			console.log("leaveCommunity error", error);
			setError(error.message);
		}
		setLoading(false);
	};

	const getCommunityData = async (communityId: string) => {
		try {
			const communityDocRef = doc(firestore, "communities", communityId);
			const communityDoc = await getDoc(communityDocRef);
			setCommunityStateValue((prev) => ({
				...prev,
				currentCommunity: {
					id: communityDoc.id,
					...communityDoc.data(),
				} as Community,
			}));
		} catch (error: any) {
			console.log("getCommunityData error", error);
		}
	};

	useEffect(() => {
		if (!user) {
			setCommunityStateValue((prev) => ({
				...prev,
				mySnippets: [],
				snippetsFetched: false,
			}));
			return;
		}
		getMySnippets();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	useEffect(() => {
		const { communityId } = router.query;

		if (communityId && !communityStateValue.currentCommunity) {
			getCommunityData(communityId as string);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.query, communityStateValue.currentCommunity]);

	return {
		// data and functions
		communityStateValue,
		onJoinOrLeaveCommunity,
		loading,
	};
};
export default useCommunityData;
