import { Alert, AlertIcon, AlertTitle, Flex, Icon } from "@chakra-ui/react";
import { User } from "firebase/auth";
import {
	addDoc,
	collection,
	serverTimestamp,
	Timestamp,
	updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { BiPoll } from "react-icons/bi";
import { BsLink45Deg, BsMic } from "react-icons/bs";
import { IoDocumentText, IoImageOutline } from "react-icons/io5";
import { firestore, storage } from "../../firebase/clientApp";
import useSelectFile from "../../hooks/useSelectFile";
import ImageUpload from "./PostForm/ImageUpload";
import TextInputs from "./PostForm/TextInputs";
import TabItem from "./TabItem";

type NewPostFormProps = {
	user: User;
};

const formTabs: TabItem[] = [
	{
		title: "Post",
		icon: IoDocumentText,
	},
	{
		title: "Images & Video",
		icon: IoImageOutline,
	},
	{
		title: "Link",
		icon: BsLink45Deg,
	},
	{
		title: "Poll",
		icon: BiPoll,
	},
	{
		title: "Talk",
		icon: BsMic,
	},
];

export type TabItem = {
	title: string;
	icon: typeof Icon.arguments;
};

const NewPostForm: React.FC<NewPostFormProps> = ({ user }) => {
	const router = useRouter();
	const [selectedTab, setSelectedTab] = useState(formTabs[0].title);
	const [textInputs, setTextInputs] = useState({
		title: "",
		body: "",
	});
	const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	const handleCreatePost = async () => {
		const { communityId } = router.query;

		// Create new post object => type Post
		const newPost = {
			communityId: communityId as string,
			creatorId: user?.uid,
			creatorDisplayName: user.email!.split("@")[0],
			title: textInputs.title,
			body: textInputs.body,
			numberOfComments: 0,
			voteStatus: 0,
			createdAt: serverTimestamp() as Timestamp,
		};

		setLoading(true);
		try {
			// Store the post in db
			const postDocRef = await addDoc(collection(firestore, "posts"), newPost);

			console.log("HERE IS THE NEW POST ID", postDocRef.id);

			// Check for selectedFile
			if (selectedFile) {
				// If yes, store in firebase storage instead of firestore => getDownloadURL (return imageURL)
				const imageRef = ref(storage, `posts/${postDocRef.id}/image`);
				await uploadString(imageRef, selectedFile, "data_url");
				const downloadURL = await getDownloadURL(imageRef);

				// Update post doc by adding imageURL
				await updateDoc(postDocRef, {
					imageURL: downloadURL,
				});
			}
			// Redirect the user back to the communityPage using the router
			router.back();
		} catch (error: any) {
			console.log("handleCreatePost error", error.message);
			setError(true);
		}
		setLoading(false);
	};

	const onTextChange = (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const {
			target: { name, value },
		} = event;
		setTextInputs((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	return (
		<Flex direction="column" bg="white" borderRadius={4} mt={2}>
			<Flex width="100%">
				{formTabs.map((item) => (
					<TabItem
						key={item.title}
						item={item}
						selected={item.title === selectedTab}
						setSelectedTab={setSelectedTab}
					/>
				))}
			</Flex>
			<Flex p={4}>
				{selectedTab === "Post" && (
					<TextInputs
						textInputs={textInputs}
						handleCreatePost={handleCreatePost}
						onChange={onTextChange}
						loading={loading}
					/>
				)}
				{selectedTab === "Images & Video" && (
					<ImageUpload
						selectedFile={selectedFile}
						onSelectImage={onSelectFile}
						setSelectedTab={setSelectedTab}
						setSelectedFile={setSelectedFile}
					/>
				)}
			</Flex>
			{error && (
				<Alert status="error">
					<AlertIcon />
					<AlertTitle>Error creating post</AlertTitle>
				</Alert>
			)}
		</Flex>
	);
};
export default NewPostForm;
