from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse


ROOT = Path(__file__).resolve().parents[1]
PREFIX = "/apps/wallpaper/"


class AssetParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.assets: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "link" and values.get("href"):
            self.assets.append(values["href"] or "")
        if tag == "script" and values.get("src"):
            self.assets.append(values["src"] or "")


def test_static_assets_resolve_under_uda_prefix_and_at_lan_root() -> None:
    parser = AssetParser()
    parser.feed((ROOT / "index.html").read_text(encoding="utf-8"))

    assert parser.assets == ["styles.css", "app.js"]
    assert all(not asset.startswith("/") for asset in parser.assets)

    public_page = "https://tanyaanne.ddns.net" + PREFIX
    assert [urlparse(urljoin(public_page, asset)).path for asset in parser.assets] == [
        PREFIX + "styles.css",
        PREFIX + "app.js",
    ]

    lan_page = "http://192.168.1.249:5087/"
    assert [urlparse(urljoin(lan_page, asset)).path for asset in parser.assets] == [
        "/styles.css",
        "/app.js",
    ]


def test_browser_code_has_no_root_bound_network_requests() -> None:
    source = (ROOT / "app.js").read_text(encoding="utf-8")
    assert 'fetch("/' not in source
    assert "fetch('/" not in source
