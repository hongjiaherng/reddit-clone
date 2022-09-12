import { IconBaseProps, IconType } from "react-icons";
import { TiHome } from "react-icons/ti";
import { atom } from "recoil";

export type DirectoryMenuItem = {
	icon: IconType;
	displayText: string;
	link: string;
	iconColor: string;
	imageURL?: string;
};

interface DirectoryMenuState {
	isOpen: boolean;
	selectedMenuItem: DirectoryMenuItem;
}

export const defaultMenuItem: DirectoryMenuItem = {
	icon: TiHome,
	displayText: "Home",
	link: "/",
	iconColor: "black",
};

export const defaultMenuState: DirectoryMenuState = {
	isOpen: false,
	selectedMenuItem: defaultMenuItem,
};

export const directoryMenuState = atom<DirectoryMenuState>({
	key: "directorymenuState",
	default: defaultMenuState,
});
