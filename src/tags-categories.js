// categories and skills


export function getSkillsTags() {
	const tags = ["3d-interior-design", "3d-model-creation", "3d-set-design", "3d-3d-printing", "animation-2d-animation", "animation-3d-animation", "animation-3d-modelling", "animation-compositing", "animation-infographics", "animation-motion-graphics", "animation-stop-motion-animation", "fashion-clothing-production", "fashion-fashion-design", "fashion-t-shirt-design", "graphics-brand-design", "graphics-concept-art", "graphics-illustration", "graphics-logo-design", "graphics-photoshop", "graphics-storyboarding", "music-audio-recording-and-editing", "music-boom-operator", "music-composition", "music-dj", "music-dubbing-and-subtitles", "music-live-perforamnce", "music-podcasting", "music-radio", "music-sound-effects", "music-sound-engineer", "performance-acting", "performance-ballet", "performance-burlesque", "performance-circus", "performance-clowning", "performance-directing", "performance-drag", "performance-improv", "performance-interpretive-dance", "performance-modern-dance", "performance-performance-art", "performance-stage-and-production-management", "performance-stand-up-comedy", "performance-workshops", "photography-event-photography", "photography-documentary-photography", "photography-pet-photography", "photography-photo-editing", "photography-portrait-photography", "photography-wildlife-photography", "video-aerial-drone", "video-directing", "video-lighting-artist", "video-producer", "video-runner", "video-scripting", "video-editing", "video-videography", "games-blueprint-design", "games-c++", "games-c#", "games-games-design", "games-level-design", "games-qa-testing", "games-unity", "games-unreal", "games-virtual-reality", "vfx-motion-graphics", "vfx-procedural-modeling", "vfx-rotoscoping", "vfx-simulation", "vfx-texturing", "web-ui-ux-design", "web-search-engine-optimisation", "web-website-design", "web-website-production", "writing-blogs", "writing-copywriting-and-proofing", "writing-creative-writing", "writing-journalism", "writing-script-writing"];
	return tags;
}

export function getCategories() {
	const categories = [
		{"category":"3d", "description":"3D Design"}, 
		{"category":"animation", "description":"Computer Animation"},
		{"category":"fashion", "description":"Fashion"}, 
		{"category":"graphics", "description":"Graphic Design"}, 
		{"category":"music", "description":"Music and Sound"}, 
		{"category":"performance", "description":"Performance"}, 
		{"category":"photography", "description":"Photography"}, 
		{"category":"video", "description":"Video"}, 
		{"category":"games", "description":"Video Games"}, 
		{"category":"vfx", "description":"Visual Effects"}, 
		{"category":"web", "description":"Web Development"}, 
		{"category":"writing", "description":"Writing and Copy"}, 
	]
	return categories;
}