{ pkgs }: {
	deps = [
    pkgs.ffmpeg-full
    # pkgs.ffmpeg.bin
    # pkgs.ffmpeg
		pkgs.nodejs-18_x
    pkgs.nodePackages.typescript-language-server
    pkgs.yarn
    pkgs.replitPackages.jest
	];
}