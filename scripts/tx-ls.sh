#!/bin/bash
#
# List all React components that have corresponding Transifex resources (based on their json files).
# This helps identify obsolete Tx resources that no longer have corresponding React components.
# To remove an obsolete Tx resource:
# - delete the corresponding json file under `localization/transifex`, `localization/react-intl`, `localization/translations`
# - delete the resource itself on the Tx site
#
find localization/transifex/ -name '*.json' | while read f; do tx="${f##localization/transifex/}"; ls -la ${tx/json/js}; done
